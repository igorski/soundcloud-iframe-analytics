import TinyScriptLoader from "tiny-script-loader";
import { trackEvent } from "./analytics";

const SOUNDCLOUD_API_URL       = "https://w.soundcloud.com/player/api.js";
const SOUNDCLOUD_EMBED         = "soundcloud.com"; // URL fragment to determine iframe widget embed
const ANALYTICS_EVENT_CATEGORY = "SoundCloud";

/**
 * Automatically attach Analytics handlers to all embedded
 * SoundCloud <iframe> Elements currently in the page
 */
function init() {

    // retrieve all <iframe> embeds and filter them by the SoundCloud URL
    // we use older DOM methods instead of querySelectorAll() to provide
    // a very simple backwards compatibility

    const iframes   = document.getElementsByTagName( "iframe" );
    const playlists = [];
    loop( iframes, ( iframe ) => {
        if ( iframe.hasAttribute( "src" ) && iframe.getAttribute( "src" ).indexOf( SOUNDCLOUD_EMBED ) > -1 )
            playlists.push( iframe );
    });

    // if no playlists were found, don't do anything.

    if ( playlists.length === 0 )
        return;

    // process all IFrames one by one and add event listeners and Analytics hooks

    const processIFrames = () => {
        loop( playlists, ( playlist ) => {
            const widget = SC.Widget( playlist );
            attachSoundCloudAnalytics( widget );
        });
    };

    // ensure the SoundCloud Widget API has been loaded
    // after which the processing of the IFrames can start

    if ( "SC" in window && typeof SC.Widget === "function" ) {
        processIFrames();
    }
    else {
        TinyScriptLoader.loadScript( SOUNDCLOUD_API_URL, processIFrames );
    }
}

/**
 * Attach event listeners and hooks into Analytics
 * to a provided instance of SC.Widget
 *
 * @param {SC.Widget} widget
 */
function attachSoundCloudAnalytics( widget ) {

    const ENUM = SC.Widget.Events;

    // we can have multiple playlists, all their individual data
    // is stored inside the closure of this function without
    // requiring pollution of external scope

    let hasTimeout = false, currentTrackTitle = "", currentTrackId = 0, tracks = {}, vo;

    // cache the id of the currently playing track as many events in the
    // playlist can cause this to change (e.g. finish fires after which
    // the currentSound is returned as the next track in the playlist queue...)
    // we poll this at an INTERVAL to prevent overusing API calls

    const INTERVAL = 2500;

    widget.bind( ENUM.READY, () => {
        // no need to track, can be used for debugging purposes
    });

    widget.bind( ENUM.ERROR, () => {
        trackEvent( ANALYTICS_EVENT_CATEGORY, "Error", currentTrackTitle );
    });

    widget.bind( ENUM.PLAY_PROGRESS, ( playerData ) => {

        if ( vo && vo.id === playerData.soundId )
            setTrackProgress( vo, playerData );

        if ( hasTimeout )
            return;

        hasTimeout = true;

        setTimeout(() => {

            hasTimeout = false;
            widget.getCurrentSound(( data ) => {

                // last id does not equal new id, update
                // and clear the tracks store (if we go back
                // to a previously played track, we can collect
                // behavioural data for it again)

                if ( currentTrackId !== data.id ) {
                    currentTrackTitle = data.title;
                    currentTrackId    = data.id;
                    tracks = {};
                }
            });

        }, ( currentTrackId === 0 ) ? 0 : INTERVAL );
    });

    widget.bind( ENUM.PLAY, () => {
        widget.getCurrentSound(( data ) => {

            currentTrackTitle = data.title;
            currentTrackId    = data.id;

            vo = getSoundCloudTrackVO( tracks, data.title, data.id );

            if ( !vo.started || vo.finished ) {

                vo.started  = true;
                vo.finished = false;
                vo.paused   = false;
                vo.scrubbed = false;
                vo.progress = 0;
                vo.progstep = 0;

                trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback started", currentTrackTitle );
            }
            else if ( vo.paused ) {
                vo.paused = false;
                trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback resumed", currentTrackTitle );
            }
        });
    });

    // we do not invoke trackSoundCloudEvent() here as getCurrentSound() can have moved to the next song!

    widget.bind( ENUM.PAUSE, () => {
        vo = getSoundCloudTrackVO( tracks, currentTrackTitle, currentTrackId );

        // do async check for current sound, if it is the same then
        // we can treat the track as paused, if not then the pause
        // was triggered either before the track finished playing
        // or before the playlist queued another track
        // TODO: this still triggers a pause when starting a
        // track in a different widget API

        widget.getCurrentSound(( data ) => {
            if ( data.id === vo.id && !vo.finished ) {
                vo.paused = true;
                trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback paused", currentTrackTitle );
            }
        });
    });
    widget.bind( ENUM.SEEK, ( playerData ) => {
        vo = getSoundCloudTrackVO( tracks, currentTrackTitle, currentTrackId );

        // only once per play

        if ( vo.scrubbed )
            return;

        if ( !vo.paused && !vo.finished ) {
            vo.scrubbed = true;
            trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback scrubbed", currentTrackTitle );
        }
    });
    widget.bind( ENUM.FINISH, () => {
        vo = getSoundCloudTrackVO( tracks, currentTrackTitle, currentTrackId );
        if ( !vo.finished ) {
            vo.finished = true;
            const event = ( !vo.scrubbed ) ? "Played in full" : "Played in full with scrubbing";
            trackEvent( ANALYTICS_EVENT_CATEGORY, event, currentTrackTitle );
        }
    });
}

export { init, attachSoundCloudAnalytics };

/* internal methods */

/**
 * Retrieves a Value Object associated with the playback
 * state of a specific SoundCloud track. If it hasn't been
 * created yet, it will create it inline.
 *
 * @param {Object} tracks data store for the tracks
 * @param {string} title of the track
 * @param {number} id identifier of the track
 * @returns {Object}
 */
function getSoundCloudTrackVO( tracks, title, id ) {

    if ( !tracks.hasOwnProperty( title )) {
        tracks[ title ] = {
            title:    title,    // track title, used as label for Google Analytics
            id:       id,       // track unique identifier on SoundCloud
            started:  false,    // whether track has started its playback
            paused:   false,    // whether track playback is paused
            scrubbed: false,    // whether track has been scrubbed during playback
            finished: false,    // whether track has finished its playback, e.g. reached the end
            progress: 0,        // current track playback progress (0 - 100 range)
            progstep: 0         // the progress that has been tracked so far (4 steps, once every 25%)
        };
    }
    else if ( tracks[ title ].id === 0 ) {
        tracks[ title].id = id;
    }
    return tracks[ title ];
}

/**
 * Get the track playback progress (in percent)
 *
 * @param {Object} playerData progress data Object
 */
function sanitizeProgress( playerData ) {
    return Math.round( playerData.relativePosition * 100 );
}

/**
 * Updates the progress value of the given VO
 * This also broadcasts the progress every 25 % of the track playback
 *
 * @param {Object} vo SoundCloud Value Object
 * @param {Object} playerData progress data Object
 */
function setTrackProgress( vo, playerData ) {

    if ( typeof playerData.relativePosition !== "number" )
        return;

    vo.progress = sanitizeProgress( playerData );

    // track once every 25 %

    let msg;

    if ( vo.progress >= 99 && vo.progstep < 4 ) {
        msg = "4/4";
        vo.progstep = 4;
    }
    else if ( vo.progress >= 75 && vo.progstep < 3 ) {
        msg = "3/4";
        vo.progstep = 3;
    }
    else if ( vo.progress >= 50 && vo.progstep < 2 ) {
        msg = "2/4";
        vo.progstep = 2;
    }
    else if ( vo.progress >= 25 && vo.progstep < 1 ) {
        msg = "1/4";
        vo.progstep = 1;
    }

    if ( typeof msg === "string" ) {
        if ( vo.scrubbed ) {
            msg += " with scrubbing";
        }
        trackEvent( ANALYTICS_EVENT_CATEGORY, `Progress ${msg}`, vo.title );
    }
}

/**
 * Simple forEach() implementation that will
 * go back a few old IE versions...
 *
 * @param {NodeList|Array} list
 * @param {Function} fn function to execute on each list entry
 */
function loop( list, fn ) {
    for ( let i = 0, l = list.length; i < l; ++i ) {
        fn( list[ i ]);
    }
}

import * as TinyScriptLoader from "tiny-script-loader";
import { trackEvent } from '../analytics/Analytics';

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

    // load the SoundCloud Widget API

    TinyScriptLoader.loadScript( SOUNDCLOUD_API_URL, () => {
        if ( "SC" in window ) {
            loop( playlists, ( playlist ) => {
                const widget = SC.Widget( playlist );
                window.requestAnimationFrame( attachSoundCloudAnalytics.bind( window, widget ));
            });
        }
    });
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

    let hasTimeout = false, currentId = "", tracks = {}, vo;

    // cache the id of the currently playing track as many events in the
    // playlist can cause this to change (e.g. finish fires after which
    // the currentSound is returned as the next track in the playlist queue...)
    // we poll this at an INTERVAL to prevent overusing API calls

    const INTERVAL = 2500;

    widget.bind( ENUM.READY, () => {
        // no need to track, can be used for debugging purposes
    });

    widget.bind( ENUM.ERROR, () => {
        trackEvent( ANALYTICS_EVENT_CATEGORY, "Error", currentId );
    });

    widget.bind( ENUM.PLAY_PROGRESS, () => {

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

                if ( currentId !== data.title ) {
                    currentId = data.title;
                    tracks = {};
                }
            });

        }, ( currentId.length === 0 ) ? 0 : INTERVAL );
    });

    widget.bind( ENUM.PLAY, () => {
        widget.getCurrentSound(( data ) => {

            currentId = data.title;
            vo = getSoundCloudTrackVO( tracks, data.title );

            if ( !vo.started || vo.finished ) {
                vo.started  = true;
                vo.finished = false;
                vo.paused   = false;
                trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback started", currentId );
            }
            else if ( vo.paused ) {
                vo.paused = false;
                trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback resumed", currentId );
            }
        });
    });

    // we do not invoke trackSoundCloudEvent() here as getCurrentSound() can have moved to the next song!

    widget.bind( ENUM.PAUSE, () => {
        vo = getSoundCloudTrackVO( tracks, currentId );

        // do async check for current sound, if it is the same then
        // we can treat the track as paused, if not then the pause
        // was triggered either before the track finished playing
        // or before the playlist queued another track
        // TODO: this still triggers a pause when starting a
        // track in a different widget API

        widget.getCurrentSound(( data ) => {
            if ( data.title === vo.id && !vo.finished ) {
                vo.paused = true;
                trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback paused", currentId );
            }
        });
    });
    widget.bind( ENUM.SEEK, () => {
        vo = getSoundCloudTrackVO( tracks, currentId );
        if ( !vo.paused && !vo.finished ) {
            trackEvent( ANALYTICS_EVENT_CATEGORY, "Playback scrubbed", currentId );
        }
    });
    widget.bind( ENUM.FINISH, () => {
        vo = getSoundCloudTrackVO( tracks, currentId );
        if ( !vo.finished ) {
            vo.finished = true;
            trackEvent( ANALYTICS_EVENT_CATEGORY, "Played in full", currentId );
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
 * @param {string} id identifier of the track
 * @returns {Object}
 */
function getSoundCloudTrackVO( tracks, id ) {

    if ( !tracks.hasOwnProperty( id )) {
        tracks[ id ] = {
            id: id,
            started: false,
            paused: false,
            finished: false
        };
    }
    return tracks[ id ];
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

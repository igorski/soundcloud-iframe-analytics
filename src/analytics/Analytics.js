const DEBUG = true;

let isEnabled = true,
    _tracker;

/**
 * Track an event. Google recommends the
 * action, category, label order of things, but the Analytics
 * dashboard orders them by category, then action.
 *
 * @param {string} category
 * @param {string} action
 * @param {string} label
 * @param {*=} optValue
 */
function trackEvent( category, action, label, optValue )
{
    if ( !isEnabled )
        return;

    const tracker = getTracker();

    if ( !tracker )
        return;

    if ( DEBUG ) {
        console.info(
            `Tracking Event: category "${category}" action "${action}" label "${label}" value "${optValue}"`
        )
    }
    tracker.event( category, action, label, optValue );
}

export { trackEvent };

/* internal methods */

/**
 * There are many Google Analytics trackers available
 * this function acts as a factory to retrieve the appropriate tracker.
 * If no tracking code can be found, Analytics will be disabled.
 *
 * @returns {Object}
 */
function getTracker() {

    if ( _tracker )
        return _tracker;

    if ( typeof window.gtag === "function" ) {
        _tracker = TRACKERS.GlobalSiteTag;
    }
    else if ( typeof window.ga === "function" ) {
        _tracker = TRACKERS.GA;
    }
    else if ( "_gaq" in window && typeof window._gaq.push === "function" ) {
        _tracker = TRACKERS.Legacy;
    }

    if ( _tracker )
        return _tracker;

    // no Google Analytics tracker code found, disable tracking

    isEnabled = false;

    return null;
}

const TRACKERS = {
    GlobalSiteTag: {
        event( category, action, label, value ) {
            window.gtag( "event", action, {
                "event_category": category,
                "event_label": label,
                "value": value
            });
        }
    },
    GA: {
        event( category, action, label, value ) {
            window.ga( "send", "event", category, action, label );
        }
    },
    Legacy: {
        event( category, action, label, value ) {
            window._gaq.push(["_trackEvent", category, action, label ]);
        }
    }
};

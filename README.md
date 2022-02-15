# SoundCloud iframe Analytics

SoundCloud Iframe Analytics (SIA) is a minimal library that attaches Google Analytics event tracking
to user interactions performed on SoundCloud iframes embedded within your HTML page, both on single
tracks as well as full playlists.

This allows you to track user behaviour as well as have the events act as beacons to
more accurately see page session duration. It also helps you in finding out how popular
some of your tracks are ;)

Multiple versions of the Google Analytics tracker are supported, namely:

* Global Site Tag (gtag)
* analytics.js (ga)
* the legacy tracker (_gaq)

See the library in action [here](http://rawgit.com/igorski/soundcloud-iframe-analytics/master/dist/index.html).

## Installation

You can install this repository as a node module using npm:

```
npm install soundcloud-iframe-analytics --save-dev
```

## How to integrate within your application

First, embed the Analytics tracking code as provided by Google into your HTML template(s).

Then, add a SoundCloud iframe embed similar to the below:

```html
    <iframe
        width="100%" height="300"
        scrolling="no" frameborder="no"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/{STRING_ID}&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true">
    </iframe>
```

Basically, you embed the SoundCloud iframes according to the embed code provided by SoundCloud.
You do not need to make any changes to the generated markup.

### The easy way : automatically attach tracking to static HTML pages

When your HTML pages are static / contain the iframe content upon delivery, you can
easily attach the Analytics tracking by adding the following snippet to your JavaScript code:

```js
import { init } from "soundcloud-iframe-analytics";

async function readyHandler() {
    document.removeEventListener( "DOMContentLoaded", readyHandler );
    const embeds = await init();
}
document.addEventListener( "DOMContentLoaded", readyHandler );
```

The above will run once when the document finishes loading. It will then scan the document for
iframes with SoundCloud content and attach the listeners automatically. The returned value is
a list of successfully bound listeners for each iframe, where each value is wrapped inside
an object like so:

```js
{
    element : HTMLIFrameElement,
    widget  : SC.Widget,
    dispose : Function
}
```

In case you are wondering what those are good for, it's good to know that if your SoundCloud
content remains on the page throughout its lifetime, you can safely ignore these. But if you
are curious, you are likely someone who is looking for...

### The "I want full control" way

In case your page is an SPA that injects/removes SoundCloud iframes at runtime, you
need to keep track of additionally added iframes _after_ the document has finished loading.
You probably also want to clean up after yourself when you no longer need these iframes.

You can attach Analytics triggers to injected iframes by passing their reference to the
_attachSoundCloudAnalytics()_-method. Your pseudo code would look like:

```js
import { init, attachSoundCloudAnalytics } from "soundcloud-iframe-analytics";

async function executedOnce() {
    await init(); // loads SoundCloud SDK
}

function executeAfterNewIframeIsInjected( iframeReference ) {
    const result = attachSoundCloudAnalytics( iframeReference );
    if ( result !== null ) {
        // SoundCloud Analytics attached successfully
        // invoke dispose() when the iframe is no longer needed / removed from page
        const { element, widget, dispose } = result;
    }
}
```

And Bob's your uncle. SIA will automatically detect whether the same iframe is
passed for attachment of Analytics events and will deduplicate everything accordingly.

## Event message format

The message format for the tracked events is:

 * **Category:** SoundCloud
 * **Action:** See list below
 * **Label:** Title of the SoundCloud track

The tracked actions are:

 * _Playback started_
 * _Playback paused_
 * _Playback resumed_
 * _Playback scrubbed_
 * _Progress (num)_
 * _Progress (num) with scrubbing_
 * _Played in full_
 * _Played in full with scrubbing_

Where:

* _starts_ are counted only once per track (unless it has finished playback, after which we can treat
it as a new play).
* _scrubbed_ and _with scrubbing_ indicates that the user has dragged the playback to a different point in the track and thus
might have skipped sections. You can use this to determine engagement. _Playback scrubbed_ is tracked only
once (unless track has finished playback and is restarted).
* _progress_ is tracked for every 25 % of the track that has been played, expected values for _(num)_ are: 1/4, 2/4, 3/4 and 4/4

## Development

### Setup

Install dependencies as usual:

```
npm install
```

### Local development

Launching a local server (_webpack-dev-server_) with livereload and
automatic recompilation on changes. Server will be available at
_http://localhost:8080_

```
npm run dev
```

### Creating a production build

```
npm run build
```

Build output will be stored in _./dist_-folder.

### Unit testing

Unit tests are run via Jest, which is installed as a dependency.
You can run the tests by using:

```
npm test
```

Unit tests go in the _./test_-folder. The file name for a unit test must
be equal to the file it is testing, but contain the suffix ".spec.js",
e.g. _Functions.js_ will have a test file _Functions.spec.js_.

### Configuration

Configurations for all target environments are in the root of the
repository in the _webpack.config.{TARGET}.js_ files.

SoundCloud IFRAME Analytics
===========================

A minimal library that attaches Google Analytics event tracking to user interactions
performed on embedded SoundCloud iframes, both on single tracks as well as playlists. It should
work from IE8 upwards - though the real concern with compatibility is probably restricted to the
requirements of the SoundCloud embed itself -

This allows you to track user behaviour as well as have the events act as beacons to
more accurately see page session duration. It also helps you in finding out how popular
some of your tracks are ;)

Several versions of Google Analytics trackers are supported, namely:

* Global Site Tag (gtag)
* analytics.js (ga)
* the legacy tracker (_gaq)

See the library in action [here](http://rawgit.com/igorski/soundcloud-iframe-analytics/master/dist/index.html).

## Installation

You can install this repository as a node module using npm:

    npm install soundcloud-iframe-analytics --save-dev

## How to integrate within your application

Firstly, embed the Analytics tracking code as provided by Google into your template(s).

### The easy way, just drop in the JS file

Embed the SoundCloud iframes according to the embed code provided by SoundCloud. You do not need to make
any changes to your markup. E.g. simply inject one or more instances of:

    <iframe width="100%" height="300"
            scrolling="no" frameborder="no"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/{STRING_ID}&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true">
    </iframe>

Include the minimized production version of the script (_./dist/sia.min.js_) at the bottom of your page
and the script will automatically attach event listeners to the iframes.

### The "I want full control" way

Alternatively, you can import the ES6 modules from the _./src_ folder and embed the library
within your custom application code. You can use this in case you already use the SoundCloud Widget
API to inject/control SoundCloud content in your page.

You can attach Analytics triggers to Widget events by passing an existing instance of _SC.Widget_ to
the _attachSoundCloudAnalytics()_ function of the _SoundCloud.js_ file, e.g.:

```JavaScript
import { attachSoundCloudAnalytics } from "soundcloud-iframe-analytics/soundcloud/SoundCloud.js";

const existingWidget = ...; // SC.Widget instance created elsewhere in your application
attachSoundCloudAnalytics( existingWidget );
```

Bob's your uncle.

## Development

### Setup

Install dependencies as usual:

    npm install

### Local development

Launching a local server (_webpack-dev-server_) with livereload and
automatic recompilation on changes. Server will be available at
_http://localhost:8080_

    npm run dev

### Creating a production build

    npm run build

Build output will be stored in _./dist_-folder.

### Unit testing

Unit tests are run via Mocha, which is installed as a dependency, along
with Chai as the assertion library. You can run the tests by using:

    npm test

Unit tests go in the _./test_-folder. The file name for a unit test must
be equal to the file it is testing, but contain the suffix ".test",
e.g. _Functions.js_ will have a test file _Functions.test.js_.

Tests will be available at _http://localhost:8080/test/test.html_.

### Configuration

Configurations for all target environments are in the root of the
repository in the _webpack.config.{TARGET}.js_ files.

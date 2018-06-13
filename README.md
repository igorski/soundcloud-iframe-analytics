SoundCloud Widget Analytics
===========================

A minimal library that attaches Google Analytics event tracking to user interactions
performed on embedded SoundCloud IFRAMEs.

This allows you to track user behaviour as well as have the events act as beacons to
more accurately see page session duration. It also helps you in finding out how popular
some of your tracks are ;)

## How to integrate

First of all, embed the Analytics trcking code as provided by Google.

You embed the IFRAMEs according to the code provided by SoundCloud. You do not need to make
any changes to your markup. E.g. simply inject one or more instances of:

    <iframe width="{NUMBER}" height="{NUMBER}"
            scrolling="no" frameborder="no"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/{STRING_ID}&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true">
    </iframe>

Include the minimized production version of the script (_./dist/swa.min.js_) and the script
will automatically attach event listeners once the page has finished loading.

Alternatively, you can import the ES6 module from the _./src_ folder and embed the library
within your custom application code.

## Setup

Install dependencies as usual:

    npm install

### Development

Launching a local server (_webpack-dev-server_) with livereload and
automatic recompilation on changes. Server will be available at
_http://localhost:8080_

    npm run dev

### Production build

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

## Configuration

Configurations for all target environments are in the root of the
repository in the _webpack.config.{TARGET}.js_ files.

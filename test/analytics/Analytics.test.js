"use strict";

const chai = require( "chai" );

import { trackEvent, reset } from '../../src/third_party/analytics.js';

describe( "Analytics", () =>
{
    /* setup */

    // use Chai assertion library
    const assert = chai.assert,
          expect = chai.expect;

    // data mocks

    const category = "foo",
          action   = "bar",
          label    = "baz",
          value    = 100;

    afterEach(() => {
        reset();
    });

    /* actual unit tests */

    it("should track using GlobalSiteTag as tracker", ( done ) => {
        window.gtag = ( type, a, data ) => {

            assert.strictEqual( type, "event" );
            assert.ok( typeof data === "object" );

            assert.strictEqual( a, action );
            assert.strictEqual( data.event_category, category );
            assert.strictEqual( data.event_label,    label );
            assert.strictEqual( data.value,          value );

            // clean up and complete test

            delete window.gtag;
            done();
        };
        trackEvent( category, action, label, value );
    });

    it("should track to the ga.js tracker", ( done ) => {
        window.ga = ( fn, type, c, a, l ) => {

            assert.strictEqual( fn,   "send" );
            assert.strictEqual( type, "event" );

            assert.strictEqual( c, category );
            assert.strictEqual( a, action );
            assert.strictEqual( l, label );

            // clean up and complete test

            delete window.ga;
            done();
        };
        trackEvent( category, action, label );
    });

    it("should track to the legacy tracker", ( done ) => {
        window._gaq = {
            push: ( args ) => {

                assert.ok( Array.isArray( args ));

                assert.strictEqual( args[0], "_trackEvent" );
                assert.strictEqual( args[1], category );
                assert.strictEqual( args[2], action );
                assert.strictEqual( args[3], label );

                // clean up and complete test

                delete window._gaq;
                done();
            }
        };
        trackEvent( category, action, label );
    });
});

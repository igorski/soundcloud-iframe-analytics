import { trackEvent, reset } from '../../src/third_party/analytics.js';

describe( "Analytics", () => {
    /* setup */

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

            expect( type ).toEqual( "event" );
            expect( typeof data ).toEqual( "object" );

            expect( a ).toEqual( action );
            expect( data.event_category ).toEqual( category );
            expect( data.event_label ).toEqual( label );
            expect( data.value ).toEqual( value );

            // clean up and complete test

            delete window.gtag;
            done();
        };
        trackEvent( category, action, label, value );
    });

    it("should track to the ga.js tracker", ( done ) => {
        window.ga = ( fn, type, c, a, l ) => {

            expect( fn ).toEqual( "send" );
            expect( type ).toEqual( "event" );

            expect( c ).toEqual( category );
            expect( a ).toEqual( action );
            expect( l ).toEqual( label );

            // clean up and complete test

            delete window.ga;
            done();
        };
        trackEvent( category, action, label );
    });

    it("should track to the legacy tracker", ( done ) => {
        window._gaq = {
            push: ( args ) => {

                expect( Array.isArray( args )).toBe( true );

                expect( args[ 0 ]).toEqual( "_trackEvent" );
                expect( args[ 1 ]).toEqual( category );
                expect( args[ 2 ]).toEqual( action );
                expect( args[ 3 ]).toEqual( label );

                // clean up and complete test

                delete window._gaq;
                done();
            }
        };
        trackEvent( category, action, label );
    });
});

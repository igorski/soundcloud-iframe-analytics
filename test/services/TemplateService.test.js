"use strict";

const chai  = require( "chai" );

import * as TemplateService from '../../src/services/TemplateService.js';

describe( "TemplateService", () =>
{
    /* setup */

    // use Chai assertion library
    const assert = chai.assert,
          expect = chai.expect;

    let container;

    // data mocks
    const templateBody  = "<h1>Mock template</h1>";
    const template = () => templateBody;
    const data = {
        title: "foo"
    };

    before(() => {
        container = document.createElement( "div" );
    });

    beforeEach(() => {
        // ensure container is empty
        container.innerHMTL = "";
    });

    /* actual unit tests */

    it( "should not inject when no valid template is passed", () => {
        const nonTemplate = {};
        assert.notOk(
            TemplateService.inject( nonTemplate, container, data ),
            "expected to fail as no valid template was passed"
        )
    });

    it( "should inject when a valid template is passed", () => {
        assert.ok(
            container.innerHMTL.length === 0,
            "expected on HTML content in the container prior to injection"
        );

        const template = () => "<h1>Foo</h1>";

        assert.ok(
            TemplateService.inject( template, container, data ),
            "expected not to fail as a valid template was passed"
        );
    });
});

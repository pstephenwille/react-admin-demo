// import React from 'react';
import { TestContext } from 'react-admin';
// import { mount } from 'enzyme';
import {render} from '@testing-library/react';

import TccDataProvider from '../tcc-data-provider';


/**
 * Mock fetch objects Response, Request and Headers
 */
const { Response, Headers, Request } = require('whatwg-fetch');

global.Response = Response;
global.Headers = Headers;
global.Request = Request;

const ccOverrides = {
    key: 'results'
};

describe('TCC data provider', () => {
    let dataProvider;

    beforeEach(() => {
        dataProvider = TccDataProvider('stubbed-url', {Response, Headers, Request}, ccOverrides);
    });

    it('should work ', ()=>{
        dataProvider.getList('stubbedUsers', {})
        expect(true).toBe(true);
    })
});



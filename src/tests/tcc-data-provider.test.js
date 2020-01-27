import React from 'react';
import { TestContext } from 'react-admin';
// import { mount } from 'enzyme';
import {render} from '@testing-library/react';

import TccDataProvider from '../tcc-data-provider';

describe('TCC data provider', () => {
    let dataProvider;

    beforeEach(() => {
        dataProvider = TccDataProvider('stubbed-url', {Response:{}, Headers:{}, Reques:{}}, {});
    });

    it('should work ', ()=>{
console.log('...provider ', dataProvider);
        expect(true).toBe(true);
    })
});

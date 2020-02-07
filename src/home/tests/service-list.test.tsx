import React from 'react';
import {shallow, mount, render, configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {List, Datagrid, TextField} from 'react-admin';

configure({adapter: new Adapter()});

import {ServicesList} from '../ServicesList';
import {TccOverrides} from '../../constants/overrides_const';

jest.mock('react-admin', () => ({
    List: ({children}) => <div/>,
    Datagrid: ({children}) => <div/>,
    TextField:({children})=><div />
}));


describe('ServicesList  ', () => {
    it('Contains only the column names from the "overrides" ', () => {
        const service = shallow(<ServicesList props={{}}/>);
        const textField = service.find(TextField);

        expect(textField.length).toEqual(TccOverrides.columnNames.length);

        for(let col=0; col<textField.length; col++){
            let field = textField.get(col).props.source;

            expect(TccOverrides.columnNames.includes(field)).toBe(true);
        }
    });
});


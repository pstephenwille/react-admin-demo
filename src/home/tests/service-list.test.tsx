import React from 'react';
import {shallow, mount, render, configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {List, Datagrid, TextField} from 'react-admin';

configure({adapter: new Adapter()});

import {ServiceList} from '../mm-services';
import {tccOverrides} from '../../constants/overrides_const';

jest.mock('react-admin', () => ({
    List: ({children}) => <div/>,
    Datagrid: ({children}) => <div/>,
    TextField:({children})=><div />
}));


describe('<ServiceList  ', () => {
    it('Contains only the column names from the "overrides" ', () => {
        const service = shallow(<ServiceList props={{}}/>);
        const textField = service.find(TextField);

        expect(textField.length).toEqual(tccOverrides.columnNames.length);

        for(let col=0; col<textField.length; col++){
            let field = textField.get(col).props.source;

            expect(tccOverrides.columnNames.includes(field)).toBe(true);
        }
    });
});


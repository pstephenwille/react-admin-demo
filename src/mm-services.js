import React from 'react';
import {List, Datagrid, TextField} from 'react-admin';
import ServicesFilter from './services-filter';
import {tccOverrides} from './overrides_const';

export const ServiceList = props => (
    <List {...props} filters={<ServicesFilter/>}>
        <Datagrid rowClick="edit">
            {tccOverrides.columnNames.map((name, id) => (<TextField key={id} source={name}/>))}
        </Datagrid>
    </List>
);


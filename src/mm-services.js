import React from 'react';
import {List, Datagrid, TextField} from 'react-admin';
import ServicesFilter from './services-filter';

export const ServiceList = props => (
    <List {...props} filters={<ServicesFilter />}>
        <Datagrid rowClick="edit">
            <TextField source="id"/>
            <TextField source="name"/>
            {/*<TextField source="username" />*/}
            <TextField source="status"/>
            {/*<TextField source="address.street" />*/}
            <TextField source="description"/>
            {/*<TextField source="website" />*/}
            <TextField source="team"/>
        </Datagrid>
    </List>
);


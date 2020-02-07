import React from 'react';
import {List, Datagrid, TextField} from 'react-admin';
import ServicesFilter from './ServicesFilter';
import {TccOverrides} from '../constants/overrides_const';

export const ServicesList = props => (
    <List {...props} filters={<ServicesFilter/>}>
        <Datagrid optimized rowClick="edit">
            {
                TccOverrides.columnNames.map(
                    (name, id) =>
                        (<TextField key={id} source={name}/>))
            }
        </Datagrid>
    </List>
);


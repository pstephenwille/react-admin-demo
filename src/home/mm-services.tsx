import React from 'react';
import {List, Datagrid, TextField} from 'react-admin';
import ServicesFilter from './services-filter';
import {tccOverrides} from '../constants/overrides_const';

export const ServiceList = props => (
    <div>
        <h1 className={'pad-l-xl'}>Home</h1>
        <List {...props} filters={<ServicesFilter/>}>
            <Datagrid optimized rowClick="edit">
                {
                    tccOverrides.columnNames.map(
                        (name, id) =>
                            (<TextField key={id} source={name}/>))
                }
            </Datagrid>
        </List>
    </div>
);


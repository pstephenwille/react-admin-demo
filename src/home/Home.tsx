import React from 'react';
import {Admin, Resource, fetchUtils} from 'react-admin';
import tccDataProvider from '../common/tcc-data-provider';
import {ServicesList} from "./ServicesList";
import {TccOverrides, TccPaths} from '../constants/overrides_const';

const dataProvider = tccDataProvider(TccPaths.base + TccPaths.resources, fetchUtils.fetch, TccOverrides);


export default () => (
    <Admin dataProvider={dataProvider}>
        <Resource name={'services'} list={ServicesList}/>
    </Admin>
);



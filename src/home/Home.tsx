import React from 'react';
import {Admin, Resource, fetchUtils} from 'react-admin';
import tccDataProvider from './tcc-data-provider';
import {ServiceList} from "./mm-services";
import {tccOverrides} from '../constants/overrides_const';

const tccUrl = 'https://metadata.tcc.li/v2/resources';
const dataProvider = tccDataProvider(tccUrl, fetchUtils.fetch, tccOverrides);


export default () => (
    <Admin dataProvider={dataProvider}>
        <Resource name={'services'} list={ServiceList}/>
    </Admin>
);



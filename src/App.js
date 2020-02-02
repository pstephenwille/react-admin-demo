import React from 'react';
import {Admin, Resource, fetchUtils} from 'react-admin';
import {UserList} from "./users";
import tccDataProvider from './tcc-data-provider';
import {ServiceList} from "./mm-services";
import {tccOverrides} from './overrides_const';

const ccUrl = 'https://metadata.tcc.li/v2/resources';
const dataProvider = tccDataProvider(ccUrl, fetchUtils.fetch, tccOverrides);


const App = () => (
    <div>
        <Admin dataProvider={dataProvider}>
            <Resource name={'services'} list={ServiceList}/>
        </Admin>

    </div>

);


export default App;

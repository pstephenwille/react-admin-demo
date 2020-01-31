import React from 'react';
import {Admin, Resource, fetchUtils} from 'react-admin';
import {UserList} from "./users";
import tccDataProvider from './tcc-data-provider';
import {ServiceList} from "./mm-services";
import {tccOverrides} from './overrides_const';

const ccUrl = 'https://metadata.tcc.li/v2/resources';
const demoUrl = 'http://jsonplaceholder.typicode.com';


const demoOverrides = {
    paginationHeader: 'x-total-count',
    autoCompleteFilters: ['name', 'email', 'status', 'company.name', 'website'],
    columnNames: ['name', 'email', 'status', 'company.name', 'website']
};
const dataProvider = tccDataProvider(ccUrl, fetchUtils.fetch, tccOverrides);
// const dataProvider = tccDataProvider(demoUrl, fetchUtils.fetch, demoOverrides);


const App = () => (
    <div>
        <Admin dataProvider={dataProvider}>
            {/*<Resource name="users" list={ListGuesser}/>*/}
            {/*<Resource name="posts" list={PostList} edit={EditGuesser} />*/}
            {/*<Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} />*/}
            {/*<Resource name="users" list={UserList}/>*/}
            <Resource name={'services'} list={ServiceList}/>
        </Admin>

    </div>

);


export default App;

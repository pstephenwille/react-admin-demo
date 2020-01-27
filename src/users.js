import React from 'react';
import {List, Datagrid, TextField, EmailField, UrlField} from 'react-admin';
import MyUrlField from "./MyUrlField";
import PostFilter from './post-filter';

export const UserList = props => (
    <div>

        <List {...props} filters={<PostFilter/>}>
            <Datagrid rowClick="edit">
                <TextField source="id"/>
                <TextField source="name"/>
                {/*<TextField source="username" />*/}
                <EmailField source="email"/>
                {/*<TextField source="address.street" />*/}
                <TextField source="status"/>„
                {/*<TextField source="website" />*/}
                <TextField source="company.name"/>
                <UrlField source="website"/>
                <MyUrlField source={'website'}/>
            </Datagrid>
        </List></div>
);



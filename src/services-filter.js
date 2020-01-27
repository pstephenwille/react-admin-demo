import React from 'react';
import {Filter, TextInput} from 'react-admin';

export default (props) => (
    <Filter {...props}>
        {/*<TextInput label="Search" source="name" alwaysOn/>*/}
        <TextInput label="Name" source="Name" />
        <TextInput label="Status" source="Status"/>
        <TextInput label="Team" source="Team"/>
    </Filter>
);


import React from 'react';
import {Filter, TextInput} from 'react-admin';

export default (props) => (
    <Filter {...props}>
        {/*<TextInput label="Search" source="name" alwaysOn/>*/}
        <TextInput label="Email" source="Email" defaultValue="Shanna"/>
        <TextInput label="Company.name" source="Company.name" />
        <TextInput label="Website" source="Website"  />
    </Filter>
);


import React from 'react';
import {
    Filter,
    SearchInput,
    SelectInput,
    ReferenceInput,
    AutocompleteInput,
} from 'react-admin';

import {tccOverrides} from './overrides_const';


export default (props) => {
    let filters = tccOverrides.autoCompleteFilters.map(name => (
        <ReferenceInput
            key={name}
            source={name}
            reference="services"
            filterToQuery={searchTerm => ({[`q?_${name}`]: searchTerm})}>
            <AutocompleteInput
                optionText={choice => `${choice[name]}`}
            />
        </ReferenceInput>

    ));

    return (
        <Filter {...props}>
            {filters}
        </Filter>
    )
};

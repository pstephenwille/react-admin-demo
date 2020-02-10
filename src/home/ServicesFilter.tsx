import React from 'react';
import {
    Filter,
    SelectInput,
    ReferenceInput,
    AutocompleteInput,
} from 'react-admin';

import {TccOverrides} from '../constants/overrides_const';


export default (props) => {
    let filters = TccOverrides.autoCompleteFilters.map(name => (
        <ReferenceInput
            key={name}
            source={name}
            reference="services"
            filterToQuery={searchTerm => ({[`q?_${name}`]: searchTerm})}>
            <AutocompleteInput
                optionText={choice => choice? `${choice[name]}`: ''}
                translateChoice={false}
            />
        </ReferenceInput>

    ));

    return (
        <Filter {...props}>
            {filters}

            <SelectInput
                id={'status'}
                source="status"
                label={'Status'}
                translateChoice={false}
                choices={[
                    {id: 'deprecated', name: 'deprecated'},
                    {id: 'internal', name: 'internal'},
                    {id: 'pending', name: 'pending'},
                    {id: 'production', name: 'production'},
                    {id: 'retired', name: 'retired'},
                    {id: 'testing', name: 'testing'},
                ]}
            />
        </Filter>
    )
};

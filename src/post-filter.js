import React from 'react';
import {
    Filter,
    TextInput,
    AutocompleteInput,
    DateInput,
    ReferenceInput,
    SearchInput,
    SelectInput,
} from 'react-admin';
import {demoOverrides, tccOverrides} from './overrides_const';

let filters = [];
let names = [];
export default (props) => {

    return (
        <Filter {...props}>
            <ReferenceInput
                source={'Email'}
                reference={'users'}
                filterToQuery={searchTerm => ({'q?email': searchTerm})}>
                <AutocompleteInput
                    optionText={choice => 'Email'}
                />
            </ReferenceInput>
        </Filter>
    )
}
;

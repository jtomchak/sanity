import {Autocomplete, AutocompleteOption, Box, Text} from '@sanity/ui'
import Preview from 'part:@sanity/base/preview?'
import {IntentLink} from 'part:@sanity/base/router'
import schema from 'part:@sanity/base/schema?'
import {getPublishedId} from 'part:@sanity/base/util/draft-utils'
import React, {useCallback, useState} from 'react'
import styled from 'styled-components'
import {useSearch} from './hooks'

const SearchOption = styled.div`
  & > a {
    display: block;
    color: inherit;
    text-decoration: none;
    outline: none;
  }

  & > a::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  & > a:hover {
    background: #def;
  }

  & > a:hover {
    background: #def;
  }
`

const EMPTY_RESULTS = []

export function DocumentSearch() {
  const [value, setValue] = useState('')
  const {data, error, isLoaded, query} = useSearch()
  const results = (isLoaded && data) || EMPTY_RESULTS
  const options = results.map(result => ({value: result.hit._id}))

  const handleInputChange = useCallback(
    (v: string) => {
      query(v)
      setValue(v)
    },
    [query]
  )

  const renderOption = useCallback(
    (option: AutocompleteOption) => {
      const result = results.find(r => r.hit._id === option.value)

      if (!result) {
        return null
      }

      const type = schema.get(result.hit._type)

      return (
        <SearchOption>
          <IntentLink
            intent="edit"
            onClick={() => handleInputChange('')}
            params={{id: getPublishedId(result.hit._id), type: type.name}}
          >
            <Box paddingX={3} paddingY={2}>
              <Preview
                value={result.hit}
                layout="default"
                type={type}
                status={<Text size={0}>{type.title}</Text>}
              />
            </Box>
          </IntentLink>
        </SearchOption>
      )
    },
    [handleInputChange, results]
  )

  return (
    <>
      <Autocomplete
        id="navbar-search"
        name="searchTerm"
        onChange={handleInputChange}
        options={options}
        placeholder="Search documents"
        renderOption={renderOption}
        value={value}
      />

      {error && <div>{error.message}</div>}
    </>
  )
}

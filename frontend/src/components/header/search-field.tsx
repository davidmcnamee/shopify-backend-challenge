/** @format */

import {gql, useQuery} from "@apollo/client";
import {ActionList} from "@shopify/polaris";
import {debounce} from "lodash";
import React, {useEffect, useRef, useState} from "react";

const SEARCH_QUERY = gql`
    query SearchQuery($query: String!) {
        search(query: $query) {
            ... on Image {
                id
                url
                title
            }
            ... on User {
                id
                username
            }
        }
    }
`;

export function useSearch() {
    const [value, setValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState("");
    const [isVisible, setVisible] = useState(false);
    const {loading, error, data} = useQuery(SEARCH_QUERY, {
        variables: {query: debouncedValue},
        skip: !debouncedValue,
    });
    console.log("VALUE IS: ", value, debouncedValue);
    const setDebounced = useRef(debounce(setDebouncedValue, 500));
    useEffect(() => {
        setDebounced.current(value);
    }, [value]);

    const results = (
        <ActionList
            items={
                !loading &&
                data &&
                data.search.map((item: any) =>
                    item.__typename === "Image"
                        ? {
                              content: item.title,
                              image: item.url,
                              prefix: "Image",
                          }
                        : {
                              content: item.username,
                              prefix: "User",
                          },
                )
            }
        />
    );

    return {
        searchValue: value,
        setSearchValue: setValue,
        searchVisible: isVisible,
        setSearchVisible: setVisible,
        searchResults: results,
    };
}

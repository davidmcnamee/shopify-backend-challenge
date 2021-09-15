/** @format */

import {gql, useQuery} from "@apollo/client";
import {ActionList, Spinner} from "@shopify/polaris";
import React, {useCallback, useEffect, useState} from "react";
import {debounce} from "lodash";

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
    const [isVisible, setVisible] = useState(false);
    // const stuff = useQuery(SEARCH_QUERY, {variables: {query: "david"}});
    // console.log(stuff);
    const {loading, error, data, refetch} = {} as any; //useQuery(SEARCH_QUERY, {
    //     variables: {query: value},
    // });
    // const refetchDebounced = useCallback(debounce(refetch,400), []);
    console.log(value, isVisible, data, loading, error);
    useEffect(() => {
        // refetch();
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

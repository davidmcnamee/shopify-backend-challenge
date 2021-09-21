/** @format */

import {gql, useQuery} from "@apollo/client";
import {TopBar} from "@shopify/polaris";
import React, {FC, useReducer, useState} from "react";
import { handleError } from "../message/error-handler";
import { useMessage } from "../message/message";
import {useSearch} from "./search-field";

const HEADER_QUERY = gql`
    query HeaderQuery {
        me {
            id
            username
        }
    }
`;

export const Header = () => {
    const {loading, error, data} = useQuery(HEADER_QUERY);
    const {
        searchValue,
        setSearchValue,
        searchVisible,
        setSearchVisible,
        searchResults,
    } = useSearch();
    const showMessage = useMessage();
    if (error) handleError(error, showMessage, "An error occurred while connecting to the server.");
    function onSearchChange(text: string) {
        setSearchValue(text);
        setSearchVisible(text.length > 0);
    }

    return (
        <TopBar
            searchField={
                <TopBar.SearchField
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="search"
                />
            }
            searchResultsVisible={searchVisible}
            onSearchResultsDismiss={() => setSearchVisible(false)}
            searchResults={searchResults}
            userMenu={<UserMenu username={data?.me?.username} />}
        />
    );
};

type UserMenuProps = {username: string};
const UserMenu: FC<UserMenuProps> = props => {
    const {username} = props;
    const [userMenuActive, toggleUserMenuActive] = useReducer(x => !x, false);
    return (
        <TopBar.UserMenu
            actions={[
                {
                    items: [
                        username
                            ? {content: "Profile", url: `/u/${username}`}
                            : {content: "Login", url: "/login"},
                    ],
                },
            ]}
            name={username}
            initials={username ? username[0] : ""}
            open={userMenuActive}
            onToggle={toggleUserMenuActive}
        />
    );
};

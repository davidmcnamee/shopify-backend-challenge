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

    return (
        <TopBar
            searchField={
                <TopBar.SearchField
                    value={searchValue}
                    onChange={setSearchValue}
                    onFocus={() => setSearchVisible(true)}
                    onCancel={() => setSearchVisible(false)}
                    onBlur={() => setSearchVisible(false)}
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
                        {content: "Profile", url: "/profile"},
                        {content: "Images", url: "/my-images"},
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

/** @format */

import {gql, useQuery} from "@apollo/client";
import {TopBar} from "@shopify/polaris";
import React, {FC, useReducer} from "react";
import SearchField from "./search-field";

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
    if (error) console.error(error);
    return (
        <TopBar
            searchField={<SearchField />}
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

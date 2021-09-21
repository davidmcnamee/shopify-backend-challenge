/** @format */

import {gql, useQuery} from "@apollo/client";
import {Avatar, Button, Layout, Page} from "@shopify/polaris";
import {SettingsMinor} from "@shopify/polaris-icons";
import Link from "next/link";
import {useRouter} from "next/router";
import React, {useState} from "react";
import styled from "styled-components";
import {GridView} from "../../components/grid-view/grid-view";
import {handleError} from "../../components/message/error-handler";
import {useMessage} from "../../components/message/message";
import {SortProps} from "../../components/modals/sort-modal";
import {UpdateUserModal} from "../../components/modals/user-settings-modal";
import PageSpinner from "../../components/util/page-spinner";
import {Left, Right, Split} from "../../components/util/split";
import {IMAGE_FIELDS} from "../../util/fragments";

const USER_PAGE_QUERY = gql`
    ${IMAGE_FIELDS}
    query UserPageQuery($username: String!, $query: ImageQuery!) {
        me {
            id
        }
        user(username: $username) {
            id
            username
            ownedImages(query: $query) {
                ...ImageFields
            }
            following {
                id
                username
            }
            followers {
                id
                username
            }
            createdAt
            price {
                amount
                discount
                currency
            }
        }
    }
`;

const UserPage = () => {
    const router = useRouter();
    const {username} = router.query;
    const showMessage = useMessage();
    const [modalOpen, setModalOpen] = useState(false);
    const [sort, setSort] = useState("UPLOAD_DATE");
    const [ascending, setAscending] = useState(false);
    const sortProps: SortProps = {
        sort,
        setSort,
        ascending,
        setAscending,
    };
    const {loading, error, data, fetchMore} = useQuery(USER_PAGE_QUERY, {
        variables: {
            username,
            query: {
                sort,
                ascending,
                offset: 0,
                limit: 30,
            },
        },
        skip: !username,
    });
    if (loading || !username) return <PageSpinner />;
    if (error)
        return handleError(
            error,
            showMessage,
            "An error occurred while fetching this profile, please try again later.",
        );

    return (
        <Page title={username as string}>
            <Layout sectioned>
                <Split>
                    <Left>
                        <Avatar initials={username[0]} />
                        {data.user.id === data.me.id && (
                            <Layout.Section>
                                <Button
                                    icon={SettingsMinor}
                                    primary
                                    onClick={() => setModalOpen(true)}
                                >
                                    Settings
                                </Button>
                                <UpdateUserModal
                                    modalOpen={modalOpen}
                                    setModalOpen={setModalOpen}
                                    user={data.user}
                                />
                            </Layout.Section>
                        )}
                    </Left>
                    <Right>
                        <Property>Username: {username}</Property>
                        <Property>ID: {data.user.id}</Property>
                        <Property>Account Created: {data.user.createdAt}</Property>
                        <Property>Following: {(data.user.following as any[]).slice(0,10).map(f => (
                            <Link href={`/u/${f.username}`}><a>{f.username}</a></Link>
                        )).reduceRight((prev, cur) => <>{prev}, {cur}</>)}</Property>
                        <Property>Followers: {(data.user.followers as any[]).slice(0,10).map(f => (
                            <Link href={`/u/${f.username}`}><a>{f.username}</a></Link>
                        )).reduceRight((prev, cur) => <>{prev}, {cur}</>)}</Property>
                    </Right>
                </Split>
                <GridView
                    data={{images: data.user.ownedImages}}
                    {...sortProps}
                    fetchMore={fetchMore}
                />
            </Layout>
        </Page>
    );
};

const Property = styled.p`
    font-weight: bold;
    font-size: 1.6rem;
`;

export default UserPage;

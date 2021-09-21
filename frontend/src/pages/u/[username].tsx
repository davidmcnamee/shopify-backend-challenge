/** @format */

import {gql, useQuery} from "@apollo/client";
import {Avatar, Button, Layout, Page} from "@shopify/polaris";
import {SettingsMinor} from "@shopify/polaris-icons";
import Link from "next/link";
import {useRouter} from "next/router";
import React, {useState} from "react";
import styled from "styled-components";
import {FollowButton} from "../../components/buttons/follow";
import {GridView} from "../../components/grid-view/grid-view";
import {handleError} from "../../components/message/error-handler";
import {useMessage} from "../../components/message/message";
import {SortProps} from "../../components/modals/sort-modal";
import {UpdateUserModal} from "../../components/modals/user-settings-modal";
import PageSpinner from "../../components/util/page-spinner";
import {Price} from "../../components/util/price";
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
            followingStatus
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
            forSale
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
                limit: 10,
            },
        },
        skip: !username,
        fetchPolicy: "network-only",
    });
    if (loading || !username) return <PageSpinner />;
    if (error)
        return handleError(
            error,
            showMessage,
            "An error occurred while fetching this profile, please try again later.",
        );
    if (!data.user)
        return showMessage(
            "We couldn't find that user in our database, double check their username and try again.",
            "error",
        );

    return (
        <Page title={username as string}>
            <Layout sectioned>
                <Split>
                    <Left>
                        <Avatar initials={username[0]} />
                        {data.user.id === data.me?.id && (
                            <>
                                <ButtonContainer>
                                    <Button
                                        icon={SettingsMinor}
                                        primary
                                        onClick={() => setModalOpen(true)}
                                    >
                                        Settings
                                    </Button>
                                </ButtonContainer>
                                <UpdateUserModal
                                    modalOpen={modalOpen}
                                    setModalOpen={setModalOpen}
                                    user={data.user}
                                />
                            </>
                        )}
                    </Left>
                    <Left>
                        <Property>Username: {username}</Property>
                        <Property>ID: {data.user.id}</Property>
                        <Property>
                            Account Created:{" "}
                            {new Date(data.user.createdAt).toLocaleString()}
                        </Property>
                        <Property>
                            Following:{" "}
                            {(data.user.following as any[])
                                .slice(0, 10)
                                .map(f => (
                                    <Link href={`/u/${f.username}`}>
                                        <a>{f.username}</a>
                                    </Link>
                                ))
                                .reduceRight(
                                    (prev, cur) =>
                                        prev ? [...prev, ", ", cur] : [cur],
                                    null as any[],
                                )}
                        </Property>
                        <Property>
                            Followers:{" "}
                            {(data.user.followers as any[])
                                .slice(0, 10)
                                .map(f => (
                                    <Link href={`/u/${f.username}`}>
                                        <a>{f.username}</a>
                                    </Link>
                                ))
                                .reduceRight(
                                    (prev, cur) =>
                                        prev ? [...prev, ", ", cur] : [cur],
                                    null as any[],
                                )}
                        </Property>
                        <FollowButton
                            followingStatus={data.user.followingStatus}
                            id={data.user.id}
                        />
                        {data.user.forSale && <Price price={data.user.price} />}
                    </Left>
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

const ButtonContainer = styled.div`
    margin-top: 2rem;
`;

const Property = styled.p`
    font-weight: bold;
    font-size: 1.6rem;
`;

export default UserPage;

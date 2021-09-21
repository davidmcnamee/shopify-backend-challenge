/** @format */

import {gql, useQuery} from "@apollo/client";
import {Button, Layout, Link, Loading, Page, Spinner, Stack} from "@shopify/polaris";
import {EditMinor} from "@shopify/polaris-icons";
import {useRouter} from "next/router";
import React, {FC, useState} from "react";
import styled from "styled-components";
import {LikeButton} from "../../components/buttons/like";
import {UpdateImageModal} from "../../components/modals/update-modal";
import PageSpinner from "../../components/util/page-spinner";
import {Left, Right, Split} from "../../components/util/split";
import {IMAGE_FIELDS} from "../../util/fragments";

const SINGLE_MEME_QUERY = gql`
    ${IMAGE_FIELDS}
    query SingleMemePage($id: ID!) {
        me {
            id
        }
        get(id: $id) {
            ... on Image {
                ...ImageFields
            }
        }
    }
`;

const SingleMemePage: FC = () => {
    const router = useRouter();
    const {id} = router.query;
    const {loading, error, data} = useQuery(SINGLE_MEME_QUERY, {
        variables: {id},
        skip: !id,
    });
    const [modalOpen, setModalOpen] = useState(false);
    if (loading || !id) return <PageSpinner />;
    if (error) return <div>error</div>;
    console.log("SUCCESS :", data);
    let oldPrice = null;
    let discountedPrice = null;
    let discount = null;
    if (data.get.price) {
        const numberFormat = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: data.get.price.currency,
        });
        oldPrice = numberFormat.format(data.get.price.amount / 100);
        if (data.get.price.discount !== 0) {
            discountedPrice = numberFormat.format(
                (data.get.price.amount * (1 - data.get.price.discount / 10000)) /
                    100,
            );
            discount = "(" + (data.get.price.discount / 100).toString() + "% off!)";
        }
    }

    return (
        <Page title={data.get.title}>
            <Image src={data.get.url} />
            <Split>
                <Left>
                    <Property>
                        Owner:{" "}
                        <Link url={`/u/${data.get.ownership.owner.username}`}>
                            {data.get.ownership.owner.username}
                        </Link>
                    </Property>
                    <Property>
                        Uploader:{" "}
                        <Link url={`/u/${data.get.ownership.uploader.username}`}>
                            {data.get.ownership.uploader.username}
                        </Link>
                    </Property>
                    {data.get.ownership.owner.id === data.me.id && (
                        <Layout.Section>
                            <Button
                                icon={EditMinor}
                                primary
                                onClick={() => setModalOpen(true)}
                            >
                                Update
                            </Button>
                            <UpdateImageModal
                                modalOpen={modalOpen}
                                setModalOpen={setModalOpen}
                                image={data.get}
                            />
                        </Layout.Section>
                    )}
                </Left>
                <Right>
                    <LikeButton
                        id={data.get.id}
                        likedByMe={data.get.likedByMe}
                        likeCount={data.get.likes}
                    />
                    {!data.get.public && <Property>PRIVATE</Property>}
                    <Property>
                        {data.get.forSale ? "FOR SALE" : "NOT FOR SALE"}
                    </Property>
                    {data.get.forSale && (
                        <Property>
                            <Discount>{discountedPrice}</Discount>{" "}
                            <RegularPrice strikethrough={discount}>
                                {oldPrice}
                            </RegularPrice>{" "}
                            {data.get.price.currency} <Discount>{discount}</Discount>
                        </Property>
                    )}
                </Right>
            </Split>
        </Page>
    );
};

const Discount = styled.span`
    color: red;
    font-weight: 700;
`;

const RegularPrice = styled.span<{strikethrough: boolean}>`
    ${p => p.strikethrough && "text-decoration: line-through;"}
`;

const Image = styled.img`
    width: 100%;
`;

const Property = styled.p`
    font-weight: bold;
    font-size: 1.6rem;
`;

export default SingleMemePage;

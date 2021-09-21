/** @format */

import {OperationVariables, QueryResult} from "@apollo/client";
import {useCallback, useEffect} from "react";
import {debounce} from "lodash";
import React, {FC} from "react";
import styled from "styled-components";
import {LikeButton} from "../buttons/like";
import {useMessage} from "../message/message";
import {SortProps} from "../modals/sort-modal";
import PageSpinner from "../util/page-spinner";
import Link from "next/link";

type GridViewProps = Partial<QueryResult<any, OperationVariables> & SortProps>;

export const GridView: FC<GridViewProps> = props => {
    const {loading, error, data, fetchMore, sort, ascending} = props;
    const showMessage = useMessage();
    const loadMoreImages = useCallback(
        () =>
            debounce(
                () =>
                    fetchMore({
                        variables: {
                            query: {
                                limit:30,
                                sort, ascending,
                                offset: data.images.length,
                            }
                        },
                    }),
                2500,
            ),
        [data],
    );
    useEffect(() => {
        const onScroll = () => {
            if (
                window.scrollY + window.innerHeight >=
                document.body.clientHeight - 100
            )
                loadMoreImages();
        };
        document.addEventListener("scroll", onScroll);
        return () => document.removeEventListener("scroll", onScroll);
    }, [loadMoreImages]);
    if (loading) return <PageSpinner />;
    if (error?.message) showMessage(error.message, "error");

    return (
        <Container>
            {data?.images?.map(image => (
                <Image image={image} key={image.id} />
            ))}
        </Container>
    );
};

const Image = ({image}) => {
    return (
        <ImageContainer>
            <Link href={`/meme/${image.id}`}>
                <a><img src={image.url} /></a>
            </Link>
            <StyledLikeButton
                id={image.id}
                likedByMe={image.likedByMe}
                likeCount={image.likes}
            />
        </ImageContainer>
    );
};

const StyledLikeButton = styled(LikeButton)`
    position: absolute;
    bottom: 1rem;
    right: 1rem;
`;

const ImageContainer = styled.div`
    width: 100%;
    height: auto;
    padding: 1rem;
    z-index: 1;
    > a > img {
        width: 100%;
        border-radius: 0.5rem;
    }
    display: flex;
    align-items: center;
    @media (min-width: 650px) {
        transition: transform 0.2s ease-in-out;
        will-change: transform, z-index;
        > a > img {
            opacity: 0.7;
            will-change: opacity;
            transition: opacity 0.2s ease-in-out;
        }
        :hover > a > img {
            opacity: 1;
        }
        :hover {
            z-index: 2;
            transform: scale(1.7);
        }
    }
`;

const Container = styled.div`
    margin: 2rem 8rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    @media (max-width: 650px) {
        grid-template-columns: 1fr;
    }
`;

/** @format */

import {gql, useMutation} from "@apollo/client";
import {useCallback} from "hoist-non-react-statics/node_modules/@types/react";
import React, {FC} from "react";
import styled, {css} from "styled-components";
import {HeartFilled} from "../../icons/heart-filled";
import {IMAGE_FIELDS} from "../../util/fragments";

const LIKE_MUTATION = gql`
    ${IMAGE_FIELDS}
    mutation LikeMutation($imageId: ID!, $like: Boolean!) {
        images {
            setLike(id: $imageId, like: $like) {
                ...ImageFields
            }
        }
    }
`;

type LikeButtonProps = {
    likedByMe: boolean; // takes precedence over current state
    id: string;
    likeCount: number;
    className?: string;
};

export const LikeButton: FC<LikeButtonProps> = ({
    id,
    likedByMe,
    likeCount,
    className,
}) => {
    const [toggleLike] = useMutation(LIKE_MUTATION, {
        variables: {imageId: id, like: !likedByMe},
    });

    return (
        <Container className={className}>
            <StyledHeart
                onClick={() => {
                    console.log("TOGGLING LIKE");
                    toggleLike();
                }}
                likedByMe={likedByMe}
            />
            <Count>{likeCount}</Count>
        </Container>
    );
};

const StyledHeart = styled(HeartFilled)<{likedByMe: boolean}>`
    cursor: pointer;
    outline: red;
    fill: ${p => (p.likedByMe ? "red" : "none")};
    transition: fill 0.2s ease-in-out;
`;

const Container = styled.div`
    width: auto;
    > * {
        margin: 0.25rem;
    }
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Count = styled.span`
    color: red;
`;

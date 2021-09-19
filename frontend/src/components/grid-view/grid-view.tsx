/** @format */

import {gql, OperationVariables, QueryResult} from "@apollo/client";
import {Spinner} from "@shopify/polaris";
import React, {FC} from "react";
import styled from "styled-components";
import {HeartOutlined} from "../../icons/heart-outlined";
import {useMessage} from "../message/message";

export const GridViewFragment = gql`
    
`

type GridViewProps = QueryResult<any, OperationVariables> & {};

export const GridView: FC<GridViewProps> = props => {
    const {loading, error, data} = props;
    const showMessage = useMessage();
    if (loading) return <Spinner />;
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
    const [isLiked, setIsLiked] = React.useState(false);

    return (
        <ImageContainer>
            <img src={image.url} />
            <StyledLikeButton />
        </ImageContainer>
    );
};

const StyledLikeButton = styled(HeartOutlined)`
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(-100%, -100%);
    height: 1rem;
    width: auto;
    z-index: 3;
`;

const ImageContainer = styled.div`
    width: 100%;
    height: auto;
    padding: 1rem;
    z-index: 1;
    > img {
        width: 100%;
        border-radius: 0.5rem;
    }
    display: flex;
    align-items: center;
    @media (min-width: 650px) {
        transition: transform 0.2s ease-in-out;
        will-change: transform, z-index;
        > img {
            opacity: 0.7;
            will-change: opacity;
            transition: opacity 0.2s ease-in-out;
        }
        :hover > img {
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

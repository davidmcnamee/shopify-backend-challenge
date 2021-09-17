/** @format */

import {OperationVariables, QueryResult} from "@apollo/client";
import {Spinner} from "@shopify/polaris";
import React, {FC} from "react";
import styled from "styled-components";
import {useMessage} from "../message/message";

type GridViewProps = QueryResult<any, OperationVariables> & {};

export const GridView: FC<GridViewProps> = props => {
    const {loading, error, data} = props;
    const showMessage = useMessage();
    if (loading) return <Spinner />;
    if (error?.message) showMessage(error.message, "error");

    return (
        <Container>
            {data?.images?.map(image => (
                <Image src={image.url} key={image.id} />
            ))}
        </Container>
    );
};

const Image = styled.img`
    width: 100%;
`;

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

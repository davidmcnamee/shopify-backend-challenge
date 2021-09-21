/** @format */

import {Spinner} from "@shopify/polaris";
import styled from "styled-components";

const PageSpinner = () => {
    return (
        <Container>
            <Spinner />
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default PageSpinner;

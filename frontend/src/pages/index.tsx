/** @format */

import {gql, useQuery} from "@apollo/client";
import styled from "styled-components";

const INDEX_PAGE = gql`
    query IndexPage {
        images {
            id
            url
        }
    }
`;

export default function Home() {
    const { loading, error, data } = useQuery(INDEX_PAGE);
    console.log(loading, error, data);

    return (
        <div>
            <h1>Main Page</h1>
            <div>{/* filters and sorts (todo) */}</div>
            <div>{/* todo: grid of images */}</div>
        </div>
    );
}

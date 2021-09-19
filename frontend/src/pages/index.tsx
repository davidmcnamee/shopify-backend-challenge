/** @format */

import {gql, useQuery} from "@apollo/client";
import {Button, Page} from "@shopify/polaris";
import {PagePlusMajor, PlusMinor} from "@shopify/polaris-icons";
import React, {useState} from "react";
import styled from "styled-components";
import {FilterSortControls, UploadControls} from "../components/grid-view/controls";
import {GridView} from "../components/grid-view/grid-view";
import {useMessage} from "../components/message/message";
import {Split} from "../components/util/split";

const INDEX_PAGE = gql`
    query IndexPage {
        images {
            id
            url
            uploader {
                id
            }
            likedByMe
        }
    }
`;

export default function Home() {
    const queryData = useQuery(INDEX_PAGE);

    return (
        <Page title="Home">
            <Split>
                <FilterSortControls />
                <UploadControls />
            </Split>
            <GridView {...queryData} />
        </Page>
    );
}

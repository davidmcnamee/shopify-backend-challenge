/** @format */

import {gql, useQuery} from "@apollo/client";
import {Button, Page} from "@shopify/polaris";
import {PagePlusMajor, PlusMinor} from "@shopify/polaris-icons";
import React, {useState} from "react";
import styled from "styled-components";
import {FilterSortControls, UploadControls} from "../components/grid-view/controls";
import {GridView} from "../components/grid-view/grid-view";
import {useMessage} from "../components/message/message";
import {SortProps} from "../components/modals/sort-modal";
import {Split} from "../components/util/split";
import {IMAGE_FIELDS} from "../util/fragments";

const INDEX_PAGE = gql`
    ${IMAGE_FIELDS}
    query IndexPage($query: ImageQuery!) {
        images(query: $query) {
            ...ImageFields
        }
    }
`;

function HomePage() {
    const [sort, setSort] = useState("UPLOAD_DATE");
    const [ascending, setAscending] = useState(false);
    const sortProps: SortProps = {
        sort,
        setSort,
        ascending,
        setAscending,
    };
    const queryData = useQuery(INDEX_PAGE, {
        variables: {
            query: {
                sort,
                ascending,
                offset: 0,
                limit: 30,
            },
        },
    });

    return (
        <Page title="Home">
            <Split>
                <FilterSortControls {...sortProps} />
                <UploadControls />
            </Split>
            <GridView {...queryData} {...sortProps} />
        </Page>
    );
}

export default HomePage;

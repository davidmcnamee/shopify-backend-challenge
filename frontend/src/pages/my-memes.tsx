/** @format */

import {gql, useQuery} from "@apollo/client";
import {Page} from "@shopify/polaris";
import React, {useState} from "react";
import {FilterSortControls, UploadControls} from "../components/grid-view/controls";
import {GridView} from "../components/grid-view/grid-view";
import {UploadImageModal} from "../components/modals/upload-modal";
import {Split} from "../components/util/split";

const MY_IMAGES_QUERY = gql`
    query MyImages {
        images {
            id
            url
        }
    }
`;

const MyImages = () => {
    const queryData = useQuery(MY_IMAGES_QUERY);

    return (
        <Page title="My Memes">
            <Split>
                <FilterSortControls />
                <UploadControls />
            </Split>
            <GridView {...queryData} />
        </Page>
    );
};

export default MyImages;

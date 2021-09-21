/** @format */

import {gql, useQuery} from "@apollo/client";
import {Button} from "@shopify/polaris";
import {PlusMinor, SortMinor} from "@shopify/polaris-icons";
import {useRouter} from "next/router";
import React, {FC, useState} from "react";
import styled from "styled-components";
import {SortModal, SortProps} from "../modals/sort-modal";
import {UploadImageModal} from "../modals/upload-modal";

type Props = SortProps;

export const FilterSortControls: FC<Props> = props => {
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <FilterSortContainer>
            {/* <Button
                onClick={() =>
                    showMessage(
                        "that functionality doesn't exist yet, sorry 😞",
                        "error",
                    )
                }
                icon={PlusMinor}
            >
                Filter
            </Button> */}
            <Button onClick={() => setModalOpen(true)} icon={SortMinor}>
                Sort
            </Button>
            <SortModal
                {...props}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </FilterSortContainer>
    );
};

const UPLOAD_BUTTON_QUERY = gql`
    query UploadButton {
        me {
            id
            username
        }
    }
`;

export const UploadControls = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const {data} = useQuery(UPLOAD_BUTTON_QUERY);
    const router = useRouter();
    return (
        <>
            <UploadImageModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
            <UploadContainer>
                <Button
                    icon={PlusMinor}
                    primary
                    onClick={() =>
                        !data?.me ? router.push("/login") : setModalOpen(true)
                    }
                >
                    Upload
                </Button>
            </UploadContainer>
        </>
    );
};

const FilterSortContainer = styled.div`
    > * {
        margin-right: 0.4rem;
    }
`;
const UploadContainer = styled.div`
    > * {
        margin-left: 0.4rem;
    }
`;

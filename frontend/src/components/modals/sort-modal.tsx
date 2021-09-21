/** @format */

import {Modal, Form, FormLayout, ChoiceList} from "@shopify/polaris";
import React, {Dispatch, SetStateAction, FC} from "react";

export type SortProps = {
    sort: string;
    setSort: (sort: string) => void;
    ascending: boolean;
    setAscending: (b: boolean) => void;
};

type ModalProps = SortProps & {
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const SortModal: FC<ModalProps> = ({
    modalOpen,
    setModalOpen,
    sort,
    setSort,
    ascending,
    setAscending,
}) => {
    return (
        <Modal
            open={modalOpen}
            title="Sort Memes"
            onClose={() => setModalOpen(false)}
            primaryAction={{content: "Done", onAction: () => setModalOpen(false)}}
        >
            <Modal.Section>
                <Form onSubmit={() => setModalOpen(false)}>
                    <FormLayout>
                        <ChoiceList
                            title="Sort field"
                            allowMultiple={false}
                            choices={[
                                {label: "Likes", value: "LIKES"},
                                {label: "Price", value: "PRICE"},
                                {label: "Upload Date", value: "UPLOAD_DATE"},
                            ]}
                            selected={[sort]}
                            onChange={([opt]) => setSort(opt)}
                        />
                        <ChoiceList
                            title="Sort field"
                            allowMultiple={false}
                            choices={[
                                {label: "Ascending", value: "ASCENDING"},
                                {label: "Descending", value: "DESCENDING"},
                            ]}
                            selected={[ascending ? "ASCENDING" : "DESCENDING"]}
                            onChange={([opt]) => setAscending(opt === "ASCENDING")}
                        />
                    </FormLayout>
                </Form>
            </Modal.Section>
        </Modal>
    );
};

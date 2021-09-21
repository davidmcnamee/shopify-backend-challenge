/** @format */

import {gql, useLazyQuery, useMutation} from "@apollo/client";
import {
    Modal,
    DropZone,
    Button,
    Caption,
    Form,
    FormLayout,
    Icon,
    Stack,
    Thumbnail,
    TextField,
    Spinner,
    Checkbox,
    ChoiceList,
} from "@shopify/polaris";
import {NoteMinor, MobileCancelMajor, PlusMinor} from "@shopify/polaris-icons";
import React, {Dispatch, SetStateAction, FC, useState, useCallback} from "react";
import {client} from "../../util/apollo";
import axios from "axios";
import {useMessage} from "../message/message";
import {zip} from "lodash";
import {useRouter} from "next/router";
import {handleError} from "../message/error-handler";
import {IMAGE_FIELDS} from "../../util/fragments";

const UPDATE_IMAGE = gql`
    ${IMAGE_FIELDS}
    mutation UpdateImage($input: UpdateImageInput!) {
        images {
            updateImage(input: $input) {
                ...ImageFields
            }
        }
    }
`;

type ModalProps = {
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    image: any;
};

export const UpdateImageModal: FC<ModalProps> = ({
    modalOpen,
    setModalOpen,
    image,
}) => {
    const showMessage = useMessage();
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState<string>(image.title);
    const [isPublic, setPublic] = useState<boolean>(image.public);
    const [forSale, setForSale] = useState<boolean>(image.forSale);
    const [amount, setAmount] = useState<string>(image.price?.amount);
    const [currency, setCurrency] = useState<string>(image.price?.currency ?? "USD");
    const [discount, setDiscount] = useState<string>(image.price?.discount);
    const [updateImage] = useMutation(UPDATE_IMAGE, {
        variables: {
            input: {
                id: image.id,
                title,
                public: isPublic,
                forSale,
                price: forSale
                    ? {
                          amount: parseFloat(amount) * 100,
                          currency,
                          discount: parseFloat(discount) * 100,
                      }
                    : undefined,
            },
        },
    });

    const submit = useCallback(async () => {
        setSubmitting(true);
        try {
            if (forSale && isNaN(parseFloat(amount)))
                return showMessage("Amount must be a number", "error");
            if (forSale && isNaN(parseFloat(discount)))
                return showMessage("Discount must be a number", "error");
            if (forSale && !currency)
                return showMessage("Currency must be selected", "error");
            await updateImage();
            showMessage("Changes saved.", "success");
        } catch (err) {
            handleError(
                err,
                showMessage,
                "Something went wrong while updating your meme, please try again later.",
            );
        } finally {
            setSubmitting(false);
        }
    }, [title, isPublic, forSale, amount, currency, discount]);

    return (
        <Modal
            open={modalOpen}
            title="Update Meme"
            onClose={() => setModalOpen(false)}
            primaryAction={{icon: PlusMinor, content: "Save", onAction: submit}}
            footer={submitting ? <Spinner /> : null}
        >
            <Modal.Section>
                <Form onSubmit={submit}>
                    <FormLayout>
                        <TextField label="Title" value={title} onChange={setTitle} />
                        <ChoiceList
                            title="Visibility"
                            allowMultiple={false}
                            choices={[
                                {label: "Public", value: "public"},
                                {label: "Private", value: "private"},
                            ]}
                            selected={[isPublic ? "public" : "private"]}
                            onChange={(value: string[]) =>
                                setPublic(value[0] === "public")
                            }
                        />
                        <Checkbox
                            label="For Sale"
                            checked={forSale}
                            onChange={() => setForSale(f => !f)}
                        />
                        {forSale && (
                            <FormLayout.Group title="Price">
                                <TextField
                                    label="Amount"
                                    type="number"
                                    placeholder="2.99"
                                    pattern="\d+(|\.\d{0,2})"
                                    value={amount}
                                    onChange={setAmount}
                                />
                                <TextField
                                    label="Currency"
                                    value={currency}
                                    onChange={setCurrency}
                                />
                                <TextField
                                    label="Discount"
                                    placeholder="50.00"
                                    type="number"
                                    pattern="\d+(|\.\d{0,2})"
                                    value={discount}
                                    onChange={setDiscount}
                                />
                            </FormLayout.Group>
                        )}
                    </FormLayout>
                </Form>
            </Modal.Section>
        </Modal>
    );
};

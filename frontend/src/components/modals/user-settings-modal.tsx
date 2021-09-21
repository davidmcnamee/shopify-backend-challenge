/** @format */

import {gql, useMutation} from "@apollo/client";
import {
    Checkbox,
    Form,
    FormLayout,
    Modal,
    Spinner,
    TextField,
} from "@shopify/polaris";
import {SaveMinor} from "@shopify/polaris-icons";
import React, {Dispatch, FC, SetStateAction, useCallback, useState} from "react";
import {IMAGE_FIELDS} from "../../util/fragments";
import {handleError} from "../message/error-handler";
import {useMessage} from "../message/message";

const UPDATE_USER = gql`
    ${IMAGE_FIELDS}
    mutation UpdateUser($input: UpdateSettingsInput!) {
        images {
            updateSettings(input: $input) {
                id
                username
                forSale
                acceptingPayments
                price {
                    amount
                    currency
                    discount
                }
            }
        }
    }
`;

type ModalProps = {
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    user: any;
};

export const UpdateUserModal: FC<ModalProps> = ({modalOpen, setModalOpen, user}) => {
    const showMessage = useMessage();
    const [submitting, setSubmitting] = useState(false);
    const [forSale, setForSale] = useState<boolean>(user.forSale);
    const [amount, setAmount] = useState<string>(user.price?.amount);
    const [currency, setCurrency] = useState<string>(user.price?.currency ?? "USD");
    const [discount, setDiscount] = useState<string>(user.price?.discount);
    const [updateImage] = useMutation(UPDATE_USER, {
        variables: {
            input: {
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
                "Something went wrong while updating your settings, please try again later.",
            );
        } finally {
            setSubmitting(false);
        }
    }, [forSale, amount, currency, discount]);

    return (
        <Modal
            open={modalOpen}
            title="Update Settings"
            onClose={() => setModalOpen(false)}
            primaryAction={{icon: SaveMinor, content: "Save", onAction: submit}}
            footer={submitting ? <Spinner /> : null}
        >
            <Modal.Section>
                <Form onSubmit={submit}>
                    <FormLayout>
                        <Checkbox
                            label="Paid Account"
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

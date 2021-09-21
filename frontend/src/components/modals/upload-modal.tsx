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

const GET_SIGNED_URLS = gql`
    query GetSignedUrls($fileExtensions: [String!]!) {
        imageUploadUrls(fileExtensions: $fileExtensions) {
            signedUrl
            key
        }
    }
`;

const UPLOAD_IMAGES = gql`
    mutation UploadImages($input: [UploadImageInput!]!) {
        images {
            uploadImages(input: $input) {
                url
                id
            }
        }
    }
`;

type ModalProps = {
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const UploadImageModal: FC<ModalProps> = ({modalOpen, setModalOpen}) => {
    const showMessage = useMessage();
    const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [title, setTitle] = useState("");
    const [isPublic, setPublic] = useState(false);
    const [uploadImages] = useMutation(UPLOAD_IMAGES);
    const router = useRouter();
    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) =>
            setFiles(files => [...files, ...acceptedFiles]),
        [],
    );
    const uploadedFiles = files.length > 0 && (
        <Stack vertical>
            {files.map((file, index) => (
                <Stack alignment="center" key={index}>
                    <Thumbnail
                        size="small"
                        alt={file.name}
                        source={
                            validImageTypes.includes(file.type)
                                ? window.URL.createObjectURL(file)
                                : NoteMinor
                        }
                    />
                    <div>
                        {file.name} <Caption>{file.size} bytes</Caption>
                    </div>
                    <Button
                        onClick={() =>
                            setFiles(files => files.filter(f => f !== file))
                        }
                        icon={<Icon source={MobileCancelMajor} />}
                    />
                </Stack>
            ))}
        </Stack>
    );
    const submit = useCallback(async () => {
        setSubmitting(true);
        try {
            const {
                data: {imageUploadUrls},
            } = await client.query({
                query: GET_SIGNED_URLS,
                variables: {
                    fileExtensions: files.map(f => {
                        const parts = f.name.split(".");
                        return parts[parts.length - 1];
                    }),
                },
                fetchPolicy: "no-cache",
            });
            await Promise.all(
                zip<any, File>(imageUploadUrls, files).map(
                    async ([{signedUrl}, file]) => axios.put(signedUrl, file),
                ),
            );
            const {
                data: {
                    images: {uploadImages: images},
                },
            } = await uploadImages({
                variables: {
                    input: imageUploadUrls.map(({key}) => ({
                        url: key,
                        forSale: false,
                        public: isPublic,
                        title: title,
                    })),
                },
            });
            showMessage("Meme(s) uploaded!", "success");
            if (images.length === 1) {
                router.push(`/meme/${images[0].id}`);
            }
        } catch (err) {
            handleError(
                err,
                showMessage,
                "Something went wrong while uploading your memes, please try again later.",
            );
        } finally {
            setSubmitting(false);
        }
    }, [files, title, isPublic]);

    return (
        <Modal
            open={modalOpen}
            title="Upload Meme(s)"
            onClose={() => setModalOpen(false)}
            primaryAction={{icon: PlusMinor, content: "Upload", onAction: submit}}
            footer={submitting ? <Spinner /> : null}
        >
            <Modal.Section>
                <Form onSubmit={submit}>
                    <FormLayout>
                        <DropZone onDrop={handleDropZoneDrop} label="Image upload">
                            <DropZone.FileUpload />
                        </DropZone>
                        {uploadedFiles}
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
                    </FormLayout>
                </Form>
            </Modal.Section>
        </Modal>
    );
};

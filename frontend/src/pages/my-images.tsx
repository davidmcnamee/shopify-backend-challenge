/** @format */

import React, {Dispatch, FC, SetStateAction, useCallback, useState} from "react";
import {
    Button,
    Caption,
    DropZone,
    Form,
    FormLayout,
    Icon,
    Modal,
    Stack,
    Thumbnail,
} from "@shopify/polaris";
import {NoteMinor, MobileCancelMajor} from "@shopify/polaris-icons";

type ModalProps = {
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
};

const UploadImageModal: FC<ModalProps> = ({modalOpen, setModalOpen}) => {
    const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
    const [files, setFiles] = useState<File[]>([]);
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
                        onClick={() => {}}
                        icon={<Icon source={MobileCancelMajor} />}
                    />
                </Stack>
            ))}
        </Stack>
    );

    return (
        <Modal
            open={modalOpen}
            title="Upload an Image"
            onClose={() => setModalOpen(false)}
        >
            <Modal.Section>
                <Form onSubmit={() => null}>
                    <FormLayout>
                        <DropZone onDrop={handleDropZoneDrop} label="image upload">
                            <DropZone.FileUpload />
                        </DropZone>
                        {uploadedFiles}
                        <input type="upload" />
                        <br />
                        <button type="submit">Upload</button>
                    </FormLayout>
                </Form>
            </Modal.Section>
        </Modal>
    );
};

const MyImages = () => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div>
                <h1>My Images</h1>
                <div>
                    <button onClick={() => setModalOpen(true)}>Upload</button>
                </div>
                <UploadImageModal
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                />
                <div>{/* grid view */}</div>
            </div>
        </>
    );
};

export default MyImages;

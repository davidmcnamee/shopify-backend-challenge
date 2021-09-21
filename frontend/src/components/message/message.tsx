/** @format */

import React, {FC} from "react";
import styled from "styled-components";

const MessageContext = React.createContext<
    (msg: string, type: "success" | "error" | "info") => void
>(() => null);

export type AddMessage = (msg: string, type: "success" | "error" | "info") => void;

export function useMessage() {
    return React.useContext(MessageContext);
}
type MessageType = {
    msgType: "success" | "error" | "info";
    type: "add" | "hide" | "remove";
    id: number;
    msg?: string;
};
type MessageReducer = (state: MessageType[], action: MessageType) => MessageType[];

type ContainerType = {messages: MessageType[]};
export const Container: FC<ContainerType> = ({messages}) => {
    const offset = [];
    let prev = null;
    let curOffset = 0;
    for (let i = 0; i < messages.length; ++i) {
        if (prev && prev.type === "add") curOffset += 1;
        prev = messages[i];
        offset.push(curOffset);
    }
    return (
        <>
            {messages.map((m, idx) => (
                <MessageContainer
                    key={m.id}
                    visible={m.type === "add"}
                    offset={offset[idx]}
                    type={m.msgType}
                >
                    {m.msg}
                </MessageContainer>
            ))}
        </>
    );
};

export function useMessageProvider() {
    const [messages, msgDispatch] = React.useReducer<MessageReducer>(
        (state, action) => {
            const newState = [...state];
            switch (action.type) {
                case "add":
                    return [...state, action];
                case "hide":
                    const i = newState.findIndex(item => item.id === action.id);
                    newState[i] = action;
                    return newState;
                case "remove":
                    return newState.filter(item => item.id !== action.id);
                default:
                    throw new Error();
            }
        },
        [],
    );

    const addMessage: AddMessage = (
        msg: string,
        type: "success" | "error" | "info",
    ) => {
        const id = Date.now();
        msgDispatch({type: "add", msg, id, msgType: type});
        setTimeout(() => {
            msgDispatch({type: "hide", id, msg, msgType: type});
            setTimeout(() => {
                msgDispatch({type: "remove", id, msg, msgType: type});
            }, 1000);
        }, 4000);
        return null;
    };
    return [MessageContext.Provider, messages, addMessage] as const;
}

const MessageContainer = styled.div<{
    visible: boolean;
    offset: number;
    type: "success" | "error" | "info";
}>`
    z-index: 999;
    border-radius: 0.5rem;
    padding: 1rem;
    position: fixed;
    left: 50%;
    transform: translateX(-50%)
        translateY(${p => (p.visible ? p.offset * 110 + 10 + "%" : "-120%")});
    top: 0;
    background-color: ${p =>
        p.type === "error"
            ? "#d9534f"
            : p.type === "success"
            ? "#5cb85c"
            : "#5bc0de"};
    color: white;
    transition: transform 0.5s ease-in-out;
`;

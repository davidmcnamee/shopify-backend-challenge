/** @format */

import {ApolloError} from "@apollo/client";
import {AddMessage} from "./message";

export function handleError(
    err: Error,
    showMessage: AddMessage,
    defaultMsg: string,
): null {
    console.error(err);
    const code = (err as ApolloError)?.graphQLErrors?.[0]?.extensions?.code;
    if (code && !["UNEXPECTED_ERROR", "INTERNAL_SERVER_ERROR"].includes(code))
        showMessage((err as ApolloError)?.graphQLErrors?.[0]?.message, "error");
    else showMessage(defaultMsg, "error");
    return null;
}

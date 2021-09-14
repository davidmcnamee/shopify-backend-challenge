/** @format */
import {ApolloClient, InMemoryCache} from "@apollo/client";

export const client = new ApolloClient({
    credentials: "include",
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    cache: new InMemoryCache(),
});

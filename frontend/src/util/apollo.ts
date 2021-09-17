/** @format */
import {ApolloClient, InMemoryCache} from "@apollo/client";
import { BatchHttpLink } from '@apollo/client/link/batch-http';

const batchHttpLink = new BatchHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    batchMax: 5,
    batchInterval: 20,
    credentials: "include",
});

export const client = new ApolloClient({
    credentials: "include",
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    cache: new InMemoryCache(),
    link: batchHttpLink,
});

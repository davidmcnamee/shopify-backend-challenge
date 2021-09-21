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
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    images: {
                        keyArgs: [],
                        merge(existing, incoming, {args: {offset = 0}}) {
                            const merged = existing ? existing.slice(0) : [];
                            for (let i = 0; i < incoming.length; ++i) {
                                merged[offset + i] = incoming[i];
                            }
                            return merged;
                        },
                    },
                },
            },
            User: {
                fields: {
                    ownedImages: {
                        keyArgs: [],
                        merge(existing, incoming, {args: {offset = 0}}) {
                            const merged = existing ? existing.slice(0) : [];
                            for (let i = 0; i < incoming.length; ++i) {
                                merged[offset + i] = incoming[i];
                            }
                            return merged;
                        },
                    },
                },
            },
        },
    }),
    link: batchHttpLink,
});

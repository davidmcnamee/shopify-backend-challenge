/** @format */

import "@shopify/polaris/dist/styles.css";
import {ApolloProvider, gql, useQuery} from "@apollo/client";
import type {AppProps} from "next/app";
import React from "react";
import {client} from "./util/apollo";
import {AppProvider} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

const ROOT_QUERY = gql`
    query RootQuery {
        me {
            id
            username
        }
    }
`;

const Header = () => {
    const {loading, error, data} = useQuery(ROOT_QUERY);
    if (error) console.error(error);
    return <div>{data && JSON.stringify(data.me)}</div>;
};

function MyApp({Component, pageProps}: AppProps) {
    return (
        <AppProvider i18n={enTranslations}>
            <ApolloProvider client={client}>
                <Header />
                <Component {...pageProps} />
            </ApolloProvider>
        </AppProvider>
    );
}

export default MyApp;

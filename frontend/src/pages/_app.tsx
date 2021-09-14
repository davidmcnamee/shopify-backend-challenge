/** @format */

import "@shopify/polaris/dist/styles.css";
import {ApolloProvider} from "@apollo/client";
import type {AppProps} from "next/app";
import React from "react";
import {client} from "../util/apollo";
import {AppProvider, Frame} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import {Header} from "../components/header/header";

function MyApp({Component, pageProps}: AppProps) {
    return (
        <ApolloProvider client={client}>
            <AppProvider i18n={enTranslations}>
                <Frame topBar={<Header />}>
                    <Component {...pageProps} />
                </Frame>
            </AppProvider>
        </ApolloProvider>
    );
}

export default MyApp;

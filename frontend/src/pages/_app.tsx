/** @format */

import "@shopify/polaris/dist/styles.css";
import {ApolloProvider} from "@apollo/client";
import type {AppProps} from "next/app";
import React from "react";
import {client} from "../util/apollo";
import {AppProvider, Frame} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import {Header} from "../components/header/header";
import {FrameExample} from "../components/frame-example";

function MyApp({Component, pageProps}: AppProps) {
    const theme = {
        logo: {
            width: 124,
            topBarSource: "/assets/logo.svg",
            contextualSaveBarSource: "/assets/logo.svg",
            url: "/",
            accessibilityLabel: "Meme Marketplace",
        },
    };
    return (
        <ApolloProvider client={client}>
            <AppProvider i18n={enTranslations} theme={theme}>
                <Frame topBar={<Header />}>
                    <Component {...pageProps} />
                </Frame>
            </AppProvider>
            {/* <FrameExample /> */}
        </ApolloProvider>
    );
}

export default MyApp;

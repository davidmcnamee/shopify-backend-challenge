/** @format */

import "@shopify/polaris/dist/styles.css";
import {ApolloProvider} from "@apollo/client";
import type {AppProps} from "next/app";
import React from "react";
import {client} from "../util/apollo";
import {AppProvider, Frame} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import {Header} from "../components/header/header";
import {
    useMessageProvider,
    Container as MsgContainer,
} from "../components/message/message";
import {FrameExample} from "../components/frame-example";

function MyApp({Component, pageProps}: AppProps) {
    const [MsgProvider, messages, addMessage] = useMessageProvider();
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
                <MsgProvider value={addMessage}>
                    <Frame topBar={<Header />}>
                        <Component {...pageProps} />
                    </Frame>
                    {/* <FrameExample /> */}
                    <MsgContainer messages={messages} />
                </MsgProvider>
            </AppProvider>
        </ApolloProvider>
    );
}

export default MyApp;

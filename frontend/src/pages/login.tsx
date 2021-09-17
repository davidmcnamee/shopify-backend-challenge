/** @format */

import {gql, useMutation} from "@apollo/client";
import {
    Button,
    Card,
    Form,
    FormLayout,
    Layout,
    Page,
    TextField,
} from "@shopify/polaris";
import {useRouter} from "next/router";
import React, {useCallback, useState} from "react";
import {handleError} from "../components/message/error-handler";
import {useMessage} from "../components/message/message";
import {client} from "../util/apollo";

const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
        users {
            login(input: $input) {
                id
                username
            }
        }
    }
`;

const REGISTER_MUTATION = gql`
    mutation Register($input: RegisterInput!) {
        users {
            register(input: $input) {
                id
                username
            }
        }
    }
`;

const Login = () => {
    const showMessage = useMessage();
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [email, setEmail] = useState("");
    const [login] = useMutation(LOGIN_MUTATION, {
        variables: {input: {username: loginUsername, password: loginPassword}},
    });
    const [register] = useMutation(REGISTER_MUTATION, {
        variables: {
            input: {username: registerUsername, password: registerPassword, email},
        },
    });
    const router = useRouter();
    const handleLogin = useCallback(async () => {
        try {
            const response = await login();
            const username = response.data.users.login.username;
            client.reFetchObservableQueries();
            showMessage(`Welcome back, ${username}!`, "success");
            if (!response.errors) router.push("/");
        } catch (err) {
            handleError(
                err,
                showMessage,
                "Something went wrong while logging you in, please try again later.",
            );
        }
    }, []);
    const handleRegisterSubmit = useCallback(async () => {
        try {
            const response = await register();
            const username = response.data.users.register.username;
            client.reFetchObservableQueries();
            showMessage(`Welcome, ${username}!`, "success");
            if (!response.errors) router.push("/");
        } catch (err) {
            handleError(
                err,
                showMessage,
                "Something went wrong while registering, please try again later.",
            );
        }
    }, []);

    return (
        <Page title="Login or Register">
            <Layout>
                <Layout.Section oneHalf>
                    <Card title="Login" sectioned>
                        <Form onSubmit={handleLogin}>
                            <FormLayout>
                                <TextField
                                    label="Username"
                                    value={loginUsername}
                                    onChange={setLoginUsername}
                                />
                                <TextField
                                    label="Password"
                                    value={loginPassword}
                                    onChange={setLoginPassword}
                                    type="password"
                                />
                                <Button onClick={handleLogin}>Login</Button>
                            </FormLayout>
                        </Form>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card title="Register" sectioned>
                        <Form onSubmit={handleRegisterSubmit}>
                            <FormLayout>
                                <TextField
                                    label="Email"
                                    value={email}
                                    onChange={setEmail}
                                />
                                <TextField
                                    label="Username"
                                    value={registerUsername}
                                    onChange={setRegisterUsername}
                                />
                                <TextField
                                    label="Password"
                                    value={registerPassword}
                                    onChange={setRegisterPassword}
                                    type="password"
                                />
                                <Button onClick={handleRegisterSubmit}>
                                    Register
                                </Button>
                            </FormLayout>
                        </Form>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default Login;

/** @format */

import {gql, useMutation} from "@apollo/client";
import {useRouter} from "next/router";
import {FormEvent, useCallback, useState} from "react";
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

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [login] = useMutation(LOGIN_MUTATION, {
        variables: {input: {username, password}},
    });
    const router = useRouter();
    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await login();
        client.refetchQueries({include: ["HeaderQuery"]});
        if (!response.errors) router.push("/");
    }, []);

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>Username:</label>
                <br />
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <br />
                <label>Password:</label>
                <br />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
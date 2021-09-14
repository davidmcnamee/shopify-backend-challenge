/** @format */

import {gql, useMutation} from "@apollo/client";
import {useRouter} from "next/router";
import {FormEvent, useCallback, useState} from "react";
import {client} from "../util/apollo";

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

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [register] = useMutation(REGISTER_MUTATION, {
        variables: {input: {username, password, email}},
    });
    const router = useRouter();
    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await register();
        client.refetchQueries({include: ["HeaderQuery"]});
        if (!response.errors) router.push("/");
    }, []);

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <br />
                <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <br />
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
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;

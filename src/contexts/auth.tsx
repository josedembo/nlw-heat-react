import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
    id: string
    name: string
    login: string
    avatar_url: string
}

type AuthContextData = {

    user: User | null;
    signInUrl: string;
    signOut: () => void

}

type authResponse = {
    token: string
    user: {
        id: string,
        name: string
        avatar_url: string
        login: string
    }
}

export const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
    children: ReactNode
}
export function AuthProvider(props: AuthProvider) {
    const [user, setUser] = useState<User | null>(null);

    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=d3cb56e360b1d87951b8`

    async function signIn(githubCode: string) {

        const response = await api.post<authResponse>("authenticate", {
            code: githubCode
        })

        const { token, user } = response.data;

        localStorage.setItem("@DoWhile:token", token);
        api.defaults.headers.common.authorization = `Bear ${token}`


        setUser(user);
    }

    function signOut() {

        setUser(null);
        localStorage.removeItem("@DoWhile:token");

    }

    useEffect(() => {
        const token = localStorage.getItem("@DoWhile:token");

        if (token) {
            api.defaults.headers.common.authorization = `Bear ${token}`

            api.get<User>("profile").then(response => {

                setUser(response.data)
            });
        }
    }, []);

    useEffect(() => {
        const url = window.location.href
        const hasGihubCode = url.includes("?code=");

        if (hasGihubCode) {
            const [urlWithoutCode, githubCode] = url.split("?code=");

            window.history.pushState({}, "", urlWithoutCode);

            signIn(githubCode);
        }

    }, []);

    return (
        <AuthContext.Provider value={{ signInUrl, user, signOut }}>
            {props.children}
        </AuthContext.Provider>
    );
}
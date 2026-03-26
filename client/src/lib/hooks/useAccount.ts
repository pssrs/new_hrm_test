import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import agent from "../api/agent";
import { getTokenExpiry, isTokenExpired } from "../util/token";

export const useAccount = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        let timer: ReturnType<typeof setTimeout> | null = null;

        if (token) {
            if (isTokenExpired(token)) {
                localStorage.removeItem("token");
                localStorage.removeItem("am");
                navigate("/login");
            } else {
                const exp = getTokenExpiry(token);
                if (exp) {
                    const msLeft = exp * 1000 - Date.now();
                    timer = setTimeout(() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userName");
                        navigate("/login");
                    }, Math.max(0, msLeft + 500));
                }
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [navigate]);

    const loginMutation = useMutation({
        mutationFn: async (loginDto: LoginDto) => {
            const response = await agent.post<User>("/account/login", {
                UserName: loginDto.email,
                Password: loginDto.password
            });
            return response.data;
        },
        onSuccess: (user) => {
            console.log("Login success", user);
            localStorage.setItem("token", user.token ?? user.token);
            localStorage.setItem("userName", user.userName ?? user.userName);
            navigate("/dashboard");
        }
    });

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    const isLoggedIn = () => {
        return !!localStorage.getItem("token");
    };

    return {
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        user: loginMutation.data,
        isLoading: loginMutation.isPending,
        isError: loginMutation.isError,
        error: loginMutation.error,
        logout,
        isLoggedIn,
    };
};

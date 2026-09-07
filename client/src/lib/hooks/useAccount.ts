import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import agent from "../api/agent";
import { getTokenExpiry, isTokenExpired } from "../util/token";

export const useAccount = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);

    const { data: usersList = [], isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await agent.get<UserList[]>("/account/users");
            return response.data;
        },
        enabled: !!localStorage.getItem("token") && !!user && user.kk === 1
    });

    const handleRedirectToLogin = useCallback(() => {
        if (!window.location.pathname.includes('login')) {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    // Load user from localStorage on mount
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const userData = JSON.parse(userStr) as User;
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(userData);
            } catch (e) {
                console.error("Failed to parse user from localStorage:", e);
            }
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        let timer: ReturnType<typeof setTimeout> | null = null;

        if (token) {
            if (isTokenExpired(token)) {
                localStorage.removeItem("token");
                localStorage.removeItem("am");
                handleRedirectToLogin();
            } else {
                const exp = getTokenExpiry(token);
                if (exp) {
                    const msLeft = exp * 1000 - Date.now();
                    timer = setTimeout(() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userName");
                        handleRedirectToLogin();
                    }, Math.max(0, msLeft + 500));
                }
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [handleRedirectToLogin]);

    const loginMutation = useMutation({
        mutationFn: async (loginDto: LoginDto) => {
            const response = await agent.post<User>("/account/login", {
                UserName: loginDto.email,
                Password: loginDto.password
            });
            return response.data;
        },
        onSuccess: async (userData) => {
            localStorage.setItem("token", userData.token ?? userData.token);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            await queryClient.invalidateQueries({ queryKey: ['users'] });

            try {
                await agent.post("/employee/setEmployeeCountMonthly");
            } catch (error) {
                console.error("Failed to set employee count:", error);
            }

            try {
                await agent.post("/leave/carryOverBalances");
            } catch (error) {
                console.error("Failed to carry over leave balances:", error);
            }

            navigate("/dashboard");
        },
        onError: (error) => {
            console.log("Login failed:", error);
        }
    });

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login", { replace: true });
    };

    const isLoggedIn = () => {
        return !!localStorage.getItem("token");
    };

    const createUserMutation = useMutation({
        mutationFn: async (userData: Omit<UserDto, 'id'>) => {
            const response = await agent.post('/account/users', userData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: async (data: { id: string; userData: Omit<UserDto, 'id'> }) => {
            const response = await agent.put(`/account/users/${data.id}`, data.userData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await agent.delete(`/account/users/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
            const response = await agent.post('/account/change-password', {
                CurrentPassword: data.currentPassword,
                NewPassword: data.newPassword
            });
            return response.data;
        },
    });

    return {
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        user,
        isLoading: loginMutation.isPending,
        isError: loginMutation.isError,
        error: loginMutation.error,
        logout,
        isLoggedIn,
        usersList,
        usersLoading,
        createUser: createUserMutation.mutateAsync,
        updateUser: updateUserMutation.mutateAsync,
        deleteUser: deleteUserMutation.mutateAsync,
        isCreatingUser: createUserMutation.isPending,
        isUpdatingUser: updateUserMutation.isPending,
        isDeletingUser: deleteUserMutation.isPending,
        changePassword: changePasswordMutation.mutateAsync,
        isChangingPassword: changePasswordMutation.isPending,
    };
};

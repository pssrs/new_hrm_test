import axios from "axios";

const sleep = (delay: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
};

const agent = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false
});

agent.interceptors.request.use(config => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

agent.interceptors.response.use(
    async response => {
        await sleep(200);
        return response;
    },
    error => {
        // Για 401: μόνο redirect αν δεν είσαι στη login
        if (error.response?.status === 401) {
            const isUsersEndpoint = error.config?.url?.includes('/account/users');

            // Αν είναι 401 για τα users και είμαι στη σελίδα /users,
            // αφήνουμε το AdminRoute να κάνει το redirect (μη redirect εδώ)
            if (isUsersEndpoint && window.location.pathname.includes('/users')) {
                return Promise.reject(error);
            }

            localStorage.removeItem("token");
            localStorage.removeItem("userName");

            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('/login') || currentPath === '/';

            // Redirect ΜΟΝΟ αν δεν είσαι ήδη στη login σελίδα
            if (!isLoginPage) {
                const basename = import.meta.env.VITE_BASENAME || '';
                window.location.href = `${basename}/login`;
            }
        }

        return Promise.reject(error);
    }
);

export default agent;

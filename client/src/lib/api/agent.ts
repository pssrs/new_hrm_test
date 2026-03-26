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
        if (error.response?.status === 401) {
            localStorage.removeItem("token");

            const basename = import.meta.env.VITE_BASENAME || '';
            window.location.href = `${basename}/login`;
        }

        return Promise.reject(error);
    }
);

export default agent;

import { useCallback } from "react";

const BASE_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function useApiClient() {
    const request = useCallback(async (path, options = {}) => {
        const response = await fetch(`${BASE_URL}${path}`, options);
        const payload = await response.json().catch(() => ({}));
        return { response, payload };
    }, []);

    const signup = useCallback(async ({ email, password, confirmPassword }) => {
        return request("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password, confirmPassword })
        });
    }, [request]);

    const login = useCallback(async ({ email, password }) => {
        return request("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
    }, [request]);

    const getInbox = useCallback(async () => {
        return request("/mail/inbox", {
            method: "GET",
            headers: {
                ...getAuthHeader()
            }
        });
    }, [request]);

    const getSentbox = useCallback(async () => {
        return request("/mail/sentbox", {
            method: "GET",
            headers: {
                ...getAuthHeader()
            }
        });
    }, [request]);

    const sendMail = useCallback(async ({ to, subject, body, from }) => {
        return request("/mail/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify({ to, subject, body, from })
        });
    }, [request]);

    const deleteMail = useCallback(async (mailId) => {
        return request(`/mail/${mailId}`, {
            method: "DELETE",
            headers: {
                ...getAuthHeader()
            }
        });
    }, [request]);

    const markMailAsRead = useCallback(async (mailId) => {
        return request(`/mail/${mailId}/read`, {
            method: "PUT",
            headers: {
                ...getAuthHeader()
            }
        });
    }, [request]);

    return {
        signup,
        login,
        getInbox,
        getSentbox,
        sendMail,
        deleteMail,
        markMailAsRead
    };
}

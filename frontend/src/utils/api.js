import { getCookie } from "./cookies";

export default async (endpoint, method, options) => {
    const headers = {
        "Content-Type": "application/json",
        cache: "no-store",
    };

    const userToken = getCookie("user-token");
    if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
    }

    const fullUrl = new URL(endpoint, import.meta.env.frontend_base_url);
    console.log("Fetching URL:", fullUrl.href);
    try {
        const response = await fetch(fullUrl, {
            method,
            headers,
            ...options,
        });
        return response;
    } catch (error) {
        console.error("API error:", error);
        return new Response(
            JSON.stringify({
                status: "error",
                message: "Verbindingsfout, probeer het later opnieuw",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};

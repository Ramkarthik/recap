export const API_BASE_url = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchApi(path: string, options: RequestInit = {}) {
    const url = `${API_BASE_url}${path}`;

    // Ensure credentials are sent with every request
    const defaultOptions: RequestInit = {
        ...options,
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
        // Handle 401 specifically if needed, likely handled by the auth check in _app.tsx
        if (response.status === 401) {
            // Optional: redirect to login or throw specific error
        }
        const errorBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errorBody}`);
    }

    return response.json();
}

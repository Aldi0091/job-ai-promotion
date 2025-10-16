const API_URL = (import.meta as any)?.env?.VITE_API_URL ?? "http://localhost:8079";


export const httpJson = async (path: string, init?: RequestInit) => {
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
    return res.json();
};
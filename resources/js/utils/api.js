const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiRequest = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

export default API_BASE_URL;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiRequest = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    };

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (!(options.body instanceof FormData)) {
        defaultOptions.headers['Content-Type'] = 'application/json';
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    // Debug: Log request details for FormData
    if (options.body instanceof FormData) {
        console.log('FormData request:', {
            url,
            method: finalOptions.method || 'GET',
            headers: finalOptions.headers,
            formDataEntries: Array.from(options.body.entries())
        });
    }

    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

export default API_BASE_URL;

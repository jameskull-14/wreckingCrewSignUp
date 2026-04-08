const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class APIClient{
    baseURL: string

    constructor(baseURL: string){
        this.baseURL = baseURL
    }

    async request(endpoint: string, options: RequestOptions){
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url , {
            headers:{
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
    
        if(!response.ok){
            const error = await response.json().catch(() => ({detail: 'Unkown error;'}));
            throw new Error(error.detail || `HTTP error! status: ${response.status}`)
        }
        if(response.status === 204){
            return null;
        }
        return response.json();
    }
}

interface RequestOptions extends
  RequestInit {
      headers?: Record<string, string>
  }

export const apiClient = new APIClient(API_BASE_URL);
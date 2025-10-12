const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL
    }


async request(endpoint, options = {}){
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

class SongAPI {
    constructor(client) {
        this.client = client;
    }

    async list(sortBy = null){
        const params = new URLSearchParams();
        if(sortBy){
            params.append('sort_by', sortBy === 'title' ? 'title' : sortBy);
        }
        const query = params.toString() ? `?${params.toString()}`: '';
        return this.client.request(`/api/songs${query}`);
    }

    async get(id){
        return this.client.request(`/api/songs/${id}`);
    }

    async create(data){
        return this.client.request('/api/songs', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async bulkCreate(songsArray){
        return this.client.request('/api/songs/bulk', {
            method: 'POST',
            body: JSON.stringify(songsArray),
        });
    }

    async update(id, data){
        return this.client.request(`/api/songs/${id}`,{
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async delete(id) {
        return this.client.request(`/api/songs/${id}`,{
            method: 'DELETE',
        })
    }

    async filter(filters, sortBy = null){
        const params = new URLSearchParams();
        if(filter.artist) params.append('artist', filters.artists);
        if(filters.genre) params.append('genre', filters.genre);
        if(sortBy) params.append('sort_by', sortBy);

        const query = params.toString() ? 1 `?${params.toString()}` : '';
        return this.client.request(`/api/songs${query}`);
    }
}

const apiClient = new APIClient(API_BASE_URL);
export const Song = new SongAPI(apiClient);

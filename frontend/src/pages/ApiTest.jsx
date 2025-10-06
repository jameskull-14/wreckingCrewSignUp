import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE_URL = 'http://localhost:8000';

export default function ApiTest() {
  const [healthResponse, setHealthResponse] = useState(null);
  const [songsResponse, setSongsResponse] = useState(null);
  const [createResponse, setCreateResponse] = useState(null);
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const testHealthEndpoint = async () => {
    setLoading({ ...loading, health: true });
    setErrors({ ...errors, health: null });
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setHealthResponse(data);
    } catch (error) {
      setErrors({ ...errors, health: error.message });
    } finally {
      setLoading({ ...loading, health: false });
    }
  };

  const testGetSongs = async () => {
    setLoading({ ...loading, songs: true });
    setErrors({ ...errors, songs: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/songs`);
      const data = await response.json();
      setSongsResponse(data);
    } catch (error) {
      setErrors({ ...errors, songs: error.message });
    } finally {
      setLoading({ ...loading, songs: false });
    }
  };

  const testCreateSong = async () => {
    setLoading({ ...loading, create: true });
    setErrors({ ...errors, create: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          song: songName,
          artist: artistName,
        }),
      });
      const data = await response.json();
      setCreateResponse(data);
      // Clear form on success
      setSongName('');
      setArtistName('');
    } catch (error) {
      setErrors({ ...errors, create: error.message });
    } finally {
      setLoading({ ...loading, create: false });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Testing Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Health Check Test */}
        <Card>
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
            <CardDescription>Test GET /health endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testHealthEndpoint}
              disabled={loading.health}
              className="w-full"
            >
              {loading.health ? 'Testing...' : 'Test Health Endpoint'}
            </Button>

            {errors.health && (
              <div className="p-3 bg-red-50 text-red-800 rounded text-sm">
                Error: {errors.health}
              </div>
            )}

            {healthResponse && (
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm font-semibold mb-2">Response:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(healthResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Get All Songs Test */}
        <Card>
          <CardHeader>
            <CardTitle>Get All Songs</CardTitle>
            <CardDescription>Test GET /api/songs endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testGetSongs}
              disabled={loading.songs}
              className="w-full"
            >
              {loading.songs ? 'Loading...' : 'Get All Songs'}
            </Button>

            {errors.songs && (
              <div className="p-3 bg-red-50 text-red-800 rounded text-sm">
                Error: {errors.songs}
              </div>
            )}

            {songsResponse && (
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm font-semibold mb-2">
                  Response ({Array.isArray(songsResponse) ? songsResponse.length : 0} songs):
                </p>
                <pre className="text-xs overflow-auto max-h-64">
                  {JSON.stringify(songsResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Song Test */}
        <Card>
          <CardHeader>
            <CardTitle>Create Song</CardTitle>
            <CardDescription>Test POST /api/songs endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="songName">Song Name</Label>
              <Input
                id="songName"
                placeholder="Enter song name"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistName">Artist Name</Label>
              <Input
                id="artistName"
                placeholder="Enter artist name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </div>

            <Button
              onClick={testCreateSong}
              disabled={loading.create || !songName || !artistName}
              className="w-full"
            >
              {loading.create ? 'Creating...' : 'Create Song'}
            </Button>

            {errors.create && (
              <div className="p-3 bg-red-50 text-red-800 rounded text-sm">
                Error: {errors.create}
              </div>
            )}

            {createResponse && (
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-sm font-semibold mb-2">Created:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(createResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure your FastAPI backend is running: <code className="bg-gray-200 px-1 rounded">uvicorn main:app --reload</code></li>
          <li>The backend should be running on <code className="bg-gray-200 px-1 rounded">http://localhost:8000</code></li>
          <li>Click the buttons above to test each API endpoint</li>
          <li>Check the responses to verify the APIs are working correctly</li>
        </ol>
      </div>
    </div>
  );
}

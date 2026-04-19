import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/Card.js";
import { Input } from "../shared/Input.js";
import { Button } from "../shared/Button.js";
import { Label } from "../shared/Label.js";
import { Music, UserPlus, LogIn, AlertCircle } from "lucide-react";

interface AuthFormProps {
    onAuthSuccess: (user: any, token: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

            const body = isLogin
                ? { email, password }
                : { email, password, first_name: firstName, last_name: lastName };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Authentication failed");
            }

            if (isLogin) {
                // Login response has access_token and user
                onAuthSuccess(data.user, data.access_token);
            } else {
                // Registration successful, now log them in
                const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const loginData = await loginResponse.json();

                if (!loginResponse.ok) {
                    throw new Error(loginData.detail || "Login after registration failed");
                }

                onAuthSuccess(loginData.user, loginData.access_token);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
                <CardHeader className="border-b border-amber-400/20">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Music className="w-7 h-7 text-gray-900" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-amber-400">
                            Karaoke Admin
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsLogin(true);
                                setError("");
                            }}
                            className={`flex-1 ${
                                isLogin
                                    ? "bg-amber-500 hover:bg-amber-600"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Login
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setIsLogin(false);
                                setError("");
                            }}
                            className={`flex-1 ${
                                !isLogin
                                    ? "bg-amber-500 hover:bg-amber-600"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Register
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="mt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <Label htmlFor="firstName" className="text-white">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required={!isLogin}
                                        className="bg-gray-900/50 border-amber-400/30 text-white"
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName" className="text-white">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="bg-gray-900/50 border-amber-400/30 text-white"
                                        placeholder="Enter your last name (optional)"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <Label htmlFor="email" className="text-white">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                                className="bg-gray-900/50 border-amber-400/30 text-white"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-white">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="bg-gray-900/50 border-amber-400/30 text-white"
                                placeholder="Minimum 8 characters"
                            />
                            {!isLogin && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Password must be at least 8 characters long
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3"
                        >
                            {loading ? (
                                "Please wait..."
                            ) : isLogin ? (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Login to Admin
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create Account
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

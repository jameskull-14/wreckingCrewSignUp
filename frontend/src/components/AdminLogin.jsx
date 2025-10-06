
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, User } from "lucide-react";

export default function AdminLogin({ isOpen, onClose, onAdminLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleLogin = async () => {
    setIsLogging(true);
    setError('');
    
    // Authenticate admin credentials
    if ((username === 'j.kullengineering@gmail.com' && password === '#13Tpdnm') ||
        (username === 'james' && password === 'admin')) {
      onAdminLogin(username);
      setUsername('');
      setPassword('');
      // Optionally close the dialog on successful login, if onAdminLogin doesn't handle it
      // onClose(); 
    } else {
      setError('Invalid admin credentials');
    }
    setIsLogging(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30 text-white">
        <DialogHeader className="border-b border-amber-400/20 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-gray-900" />
            </div>
            Admin Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="admin-username" className="text-amber-400 font-semibold">
              Admin Username
            </Label>
            <div className="relative">
              <Input
                id="admin-username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter admin username"
                className="bg-gray-800/50 border-amber-400/30 text-white placeholder:text-gray-400 pl-10"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-amber-400 font-semibold">
              Admin Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter admin password"
                className="bg-gray-800/50 border-amber-400/30 text-white placeholder:text-gray-400 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLogging}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              disabled={!username.trim() || !password.trim() || isLogging}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-900 font-semibold"
            >
              {isLogging ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                  Logging in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Login as Admin
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

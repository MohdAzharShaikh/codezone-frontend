// src/pages/Register.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import api, { isAxiosError } from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import CodeAnimationBackground from '@/components/CodeAnimationBackground'; // Import the new component
import { motion } from 'framer-motion';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setMessage('');
    setIsError(false);
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      setMessage(response.data.message || "Registration successful! Please login.");
      setIsError(false);
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2s
    } catch (error) {
      setIsError(true);
      if (isAxiosError(error) && error.response) {
        setMessage(`Registration failed: ${error.response.data.message || 'Please check your details.'}`);
      } else {
        setMessage('An unexpected error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-4 overflow-hidden">
      <CodeAnimationBackground />
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="max-w-md w-full bg-slate-900/80 backdrop-blur-sm border border-orange-500/20 text-white shadow-2xl shadow-orange-900/30 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-black bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter">
              Join CodeZone
            </CardTitle>
            <CardDescription className="text-md text-gray-400 pt-2">
              Create your account to unlock all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 py-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <input
                id="username"
                type="text"
                className="w-full p-3 bg-slate-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-white placeholder-gray-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                id="email"
                type="email"
                className="w-full p-3 bg-slate-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-white placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                id="password"
                type="password"
                className="w-full p-3 bg-slate-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-white placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>
            {message && (
              <p className={`text-sm text-center font-semibold ${isError ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full font-bold text-lg py-6 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all rounded-xl drop-shadow-lg text-white transform hover:scale-105"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-400 pb-6">
            Already have an account?
            <a href="/login" className="text-orange-400 hover:underline font-semibold ml-2">Login</a>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

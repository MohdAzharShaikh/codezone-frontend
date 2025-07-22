// src/pages/Login.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import api, { isAxiosError } from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import CodeAnimationBackground from '@/components/CodeAnimationBackground'; // Import the new component
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setIsLoggedIn, setAuthToken, setAuthUser } = useAppContext();

  const handleLogin = async () => {
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      const { token, id, username: loggedInUsername, email } = response.data;
      setIsLoggedIn(true);
      setAuthToken(token);
      setAuthUser({ id, username: loggedInUsername, email });
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify({ id, username: loggedInUsername, email }));
      setMessage('Login successful!');
      navigate('/');
    } catch (error) {
      setIsError(true);
      if (isAxiosError(error) && error.response) {
        setMessage(`Login failed: ${error.response.status} - ${error.response.data.message || 'Invalid credentials'}`);
      } else {
        setMessage('An unexpected error occurred during login.');
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
        <Card className="max-w-md w-full bg-black/60 backdrop-blur-md border-2 border-purple-500/30 text-white shadow-2xl shadow-purple-500/20 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent tracking-tighter">
              Welcome Back to CodeZone
            </CardTitle>
            <CardDescription className="text-md text-gray-300 pt-2">
              Access your personalized coding environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 py-6">
            <div className="relative">
              <input
                id="username"
                type="text"
                className="peer w-full p-3 bg-transparent border-b-2 border-gray-500 focus:border-purple-400 transition-colors outline-none text-white placeholder-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder="Username"
              />
              <label htmlFor="username" className="absolute left-3 -top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-purple-400 peer-focus:text-sm">Username</label>
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="peer w-full p-3 bg-transparent border-b-2 border-gray-500 focus:border-purple-400 transition-colors outline-none text-white placeholder-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Password"
              />
              <label htmlFor="password" className="absolute left-3 -top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-purple-400 peer-focus:text-sm">Password</label>
            </div>
            {message && (
              <p className={`text-sm text-center font-semibold ${isError ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full font-bold text-lg py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:to-red-700 transition-all rounded-xl drop-shadow-lg text-white transform hover:scale-105"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-400 pb-6">
            Don’t have an account?
            <a href="/register" className="text-purple-400 hover:underline font-semibold ml-2">Register</a>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

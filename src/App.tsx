// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom' 
import CodeSolve from './pages/CodeSolve'
import DebugZone from './pages/DebugZone'
import AIAssistant from './pages/AIAssistant'
import ClickToCode from './pages/ClickToCode'
import Register from './pages/Register'
import Login from './pages/Login'
import MainLayout from './layout/MainLayout'
import PrivateRoute from './components/PrivateRoute'
import { AppProvider, useAppContext } from './context/AppContext' 
import { useEffect } from 'react'; 

const AppContent = () => {
  const { setIsLoggedIn, setAuthToken, setAuthUser } = useAppContext(); 

  // Effect to check local storage for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setAuthToken(storedToken);
        setAuthUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setIsLoggedIn(false); // Ensure logged out state
        setAuthToken(null);
        setAuthUser(null);
      }
    } else {
        // If no token or user, ensure we are logged out
        setIsLoggedIn(false);
        setAuthToken(null);
        setAuthUser(null);
    }
  }, []); // Run once on component mount

  return (
    <Routes>
      {/* Public Routes (accessible without login) */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (require login) */}
      <Route element={<PrivateRoute />}> 
          <Route element={<MainLayout />}>
              <Route path="/" element={<CodeSolve />} />
              <Route path="/debug" element={<DebugZone />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/click-to-code" element={<ClickToCode />} />
          </Route>
      </Route>

      {/* Fallback route: If no route matches AND not on login/register, redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent /> 
    </AppProvider>
  );
}
// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Interface Definitions ---
export interface ChatMessage { text: string; sender: 'user' | 'ai'; }
export interface AuthUser { id: number; username: string; email: string; }

interface CodeSolveState {
  code: string;
  languageName: string;
  output: string;
  stdin: string;
}

export interface DebugProblem {
  id: number;
  title: string;
  description: string;
  language: string;
  codeWithError: string;
  solutionCode?: string;
}
export interface JudgeResult {
  output: string;
  status: string;
  isSuccess: boolean;
}
interface DebugZoneState {
  userCode: string;
  selectedProblem: DebugProblem | null;
  judgeResult: JudgeResult | null;
}

interface ClickToCodeState {
  code: string;
  activeLanguage: string;
  output: string;
  stdin: string;
}

interface AppContextType {
  isLoggedIn: boolean;
  authToken: string | null;
  authUser: AuthUser | null;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setAuthToken: (token: string | null) => void;
  setAuthUser: (user: AuthUser | null) => void;

  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

  codeSolveState: CodeSolveState;
  setCodeSolveState: React.Dispatch<React.SetStateAction<CodeSolveState>>;
  debugZoneState: DebugZoneState;
  setDebugZoneState: React.Dispatch<React.SetStateAction<DebugZoneState>>;
  clickToCodeState: ClickToCodeState;
  setClickToCodeState: React.Dispatch<React.SetStateAction<ClickToCodeState>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("authToken"));
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("authUser");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (authToken) localStorage.setItem("authToken", authToken);
    else localStorage.removeItem("authToken");
  }, [authToken]);

  useEffect(() => {
    if (authUser) localStorage.setItem("authUser", JSON.stringify(authUser));
    else localStorage.removeItem("authUser");
  }, [authUser]);

  // --- AI Assistant State ---
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // --- CodeSolve State --- (ROBUST INITIALIZATION)
  const [codeSolveState, setCodeSolveState] = useState<CodeSolveState>(() => {
    const defaultState = { code: "console.log('Hello World');", languageName: "JavaScript", output: "", stdin: "" };
    const saved = localStorage.getItem("codeSolveState");
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            return { ...defaultState, ...savedState }; // Merge ensures stdin is not null
        } catch (e) {
            return defaultState;
        }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem("codeSolveState", JSON.stringify(codeSolveState));
  }, [codeSolveState]);

  // --- DebugZone State ---
  const [debugZoneState, setDebugZoneState] = useState<DebugZoneState>(() => {
    const saved = localStorage.getItem("debugZoneState");
    return saved ? JSON.parse(saved) : { userCode: '', selectedProblem: null, judgeResult: null };
  });

  useEffect(() => {
    localStorage.setItem("debugZoneState", JSON.stringify(debugZoneState));
  }, [debugZoneState]);

  // --- ClickToCode State --- (ROBUST INITIALIZATION)
  const [clickToCodeState, setClickToCodeState] = useState<ClickToCodeState>(() => {
    const defaultState = {
        code: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
        activeLanguage: 'java',
        output: '',
        stdin: '',
    };
    const saved = localStorage.getItem("clickToCodeState");
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            return { ...defaultState, ...savedState }; // Merge ensures stdin is not null
        } catch (e) {
            return defaultState;
        }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem("clickToCodeState", JSON.stringify(clickToCodeState));
  }, [clickToCodeState]);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        authToken,
        authUser,
        setIsLoggedIn,
        setAuthToken,
        setAuthUser,
        chatHistory,
        setChatHistory,
        codeSolveState,
        setCodeSolveState,
        debugZoneState,
        setDebugZoneState,
        clickToCodeState,
        setClickToCodeState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
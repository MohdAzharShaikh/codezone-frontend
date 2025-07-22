// src/pages/DebugZone.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Editor from "@monaco-editor/react";
import { useAppContext, DebugProblem } from '@/context/AppContext';
import api, { isAxiosError } from '@/api/axios';
import { AnimatePresence, motion } from 'framer-motion';

// Helper Icons
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const CrossIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const BugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

export default function DebugZone() {
  const { debugZoneState, setDebugZoneState } = useAppContext();
  const { userCode, selectedProblem, judgeResult } = debugZoneState;
  const [problems, setProblems] = useState<DebugProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { authToken, isLoggedIn } = useAppContext();

  useEffect(() => {
    const fetchDebugProblems = async () => {
      setFetchError(null);
      try {
        const response = await api.get<DebugProblem[]>('/debug-problems');
        setProblems(response.data);
      } catch (error) {
        console.error('Error fetching debug problems:', error);
        setFetchError(isAxiosError(error) && error.response ? `Failed to load problems. Please log in.` : 'Failed to load debug problems. Please check network connection.');
      }
    };

    if (isLoggedIn && authToken) fetchDebugProblems();
    else setFetchError('Please log in to view debug problems.');
  }, [authToken, isLoggedIn]);

  const handleSelectProblem = (problem: DebugProblem) => {
    setDebugZoneState({
      selectedProblem: problem,
      userCode: problem.codeWithError,
      judgeResult: null
    });
  };

  const setUserCode = (code: string) => {
      setDebugZoneState(prev => ({ ...prev, userCode: code }));
  }

  const handleCheckFix = async () => {
    if (!selectedProblem) return;
    setIsLoading(true);
    setDebugZoneState(prev => ({ ...prev, judgeResult: null }));

    try {
      const languageMap: Record<string, number> = { javascript: 63, python: 71, java: 62, cpp: 54 };
      const langId = languageMap[selectedProblem.language.toLowerCase()];
      if (!langId) {
        setDebugZoneState(prev => ({ ...prev, judgeResult: { output: 'Unsupported language.', status: 'Error', isSuccess: false } }));
        return;
      }
      const response = await api.post('/judge0/execute', {
        source_code: userCode,
        language_id: langId,
        stdin: "",
      });
      const output = response.data;
      let isFixCorrect = false;
      let finalStatus = 'Completed';
      if (output.includes('Success') || (selectedProblem.language.toLowerCase() === 'java' && output.includes('Hello Java')) || (selectedProblem.language.toLowerCase() === 'python' && output.includes('6'))) {
        finalStatus = 'Success!';
        isFixCorrect = true;
      } else if (output.includes('Error') || output.includes('Compile Error')) {
        finalStatus = 'Failed (Error)';
      } else {
        finalStatus = 'Failed (Incorrect Output)';
      }
      setDebugZoneState(prev => ({...prev, judgeResult: { output, status: finalStatus, isSuccess: isFixCorrect }}));
    } catch (error) {
      console.error('Error checking fix:', error);
      const errorMsg = isAxiosError(error) && error.response ? `Backend Error: ${error.response.data}` : `Network Error: ${error}`;
      setDebugZoneState(prev => ({...prev, judgeResult: { output: errorMsg, status: 'Error', isSuccess: false }}));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4 bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
        {/* --- NEW: Integrated Header --- */}
        <motion.div
            className="flex-shrink-0 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <h1 className="text-3xl font-black bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-600 bg-clip-text text-transparent tracking-tight">
                DebugZone
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">Find and fix the bugs in the code snippets.</p>
        </motion.div>
        
        {/* --- Main Content --- */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
            <aside className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex-shrink-0">Challenges</h2>
                
                <div className="overflow-y-auto space-y-2 pr-2">
                {fetchError ? (
                    <p className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-md">{fetchError}</p>
                ) : problems.length === 0 ? (
                    <p className="text-gray-400 text-sm">Loading problems...</p>
                ) : (
                    problems.map((problem) => (
                    <button
                        key={problem.id}
                        onClick={() => handleSelectProblem(problem)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 text-sm font-medium
                        ${selectedProblem?.id === problem.id
                            ? 'bg-teal-500 text-white shadow'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {problem.title}
                        <span className={`block text-xs opacity-80 ${selectedProblem?.id === problem.id ? '' : 'text-gray-500'}`}>
                        {problem.language.charAt(0).toUpperCase() + problem.language.slice(1)}
                        </span>
                    </button>
                    ))
                )}
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="pr-2">
                <AnimatePresence mode="wait">
                    {selectedProblem ? (
                    <motion.div
                        key={selectedProblem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-teal-600 dark:text-teal-400">{selectedProblem.title}</CardTitle>
                            <CardDescription className="dark:text-gray-400">Language: {selectedProblem.language}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedProblem.description}</p>
                        </CardContent>
                        </Card>

                        <div>
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Code:</h3>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                            <Editor
                            height="300px"
                            language={selectedProblem.language.toLowerCase()}
                            value={userCode}
                            onChange={(value) => setUserCode(value || "")}
                            theme="vs-dark"
                            options={{ fontSize: 14, minimap: { enabled: true }, scrollBeyondLastLine: false, wordWrap: 'on' }}
                            />
                        </div>
                        </div>

                        <Button
                        onClick={handleCheckFix}
                        disabled={isLoading}
                        className="w-full font-bold text-lg py-6 bg-teal-600 hover:bg-teal-700 transition-all rounded-xl drop-shadow text-white"
                        >
                        {isLoading ? 'Checking...' : 'Check My Fix'}
                        </Button>

                        <AnimatePresence>
                        {judgeResult && (
                            <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            >
                            <Card className={`border-2 ${judgeResult.isSuccess ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-red-400 bg-red-50 dark:bg-red-900/20'}`}>
                                <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                                <div className={`p-2 rounded-full ${judgeResult.isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {judgeResult.isSuccess ? <CheckIcon /> : <CrossIcon />}
                                </div>
                                <CardTitle className={`text-xl font-bold ${judgeResult.isSuccess ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                    {judgeResult.status}
                                </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">Output:</h3>
                                <pre className="bg-gray-800 text-white rounded-lg p-4 text-xs whitespace-pre-wrap font-mono overflow-x-auto">
                                    {judgeResult.output}
                                </pre>
                                </CardContent>
                            </Card>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </motion.div>
                    ) : (
                    <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8"
                    >
                        <BugIcon />
                        <h3 className="mt-4 text-xl font-bold text-gray-700 dark:text-gray-200">Welcome to the DebugZone</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Select a challenge from the list on the left to get started.</p>
                    </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </main>
        </div>
    </div>
  );
}

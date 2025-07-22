// src/pages/CodeSolve.tsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import api, { isAxiosError } from '@/api/axios';
import { useAppContext } from '@/context/AppContext';

// Language options remain the same
const languageOptions = [
  { id: 63, name: "JavaScript", defaultCode: "console.log('Hello World');" },
  { id: 71, name: "Python", defaultCode: "print('Hello World')" },
  {
    id: 62,
    name: "Java",
    defaultCode: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`
  },
  {
    id: 54,
    name: "C++",
    defaultCode: `#include <iostream>

int main() {
  std::cout << "Hello World";
  return 0;
}`
  },
];

// --- Helper Icon for the Run Button ---
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.722-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);


const CodeSolve: React.FC = () => {
    // --- STATE MANAGEMENT ---
    // All state is pulled from the global AppContext to prevent resetting on tab change.
    const { codeSolveState, setCodeSolveState } = useAppContext();
    const { code, languageName, output, stdin } = codeSolveState;
    const [isLoading, setIsLoading] = React.useState(false);
    const [statusText, setStatusText] = React.useState("");
    const outputRef = useRef<HTMLPreElement>(null);

    // Determines the selected language object based on the name stored in the context.
    const selectedLanguage = languageOptions.find(l => l.name === languageName) || languageOptions[0];

    // --- EFFECTS ---
    // Automatically scrolls the output panel to the bottom when new output is added.
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    // --- HANDLERS ---
    // Handles changing the programming language.
    const handleLanguageChange = (newLanguageName: string) => {
        const newLanguage = languageOptions.find(lang => lang.name === newLanguageName)!;
        setCodeSolveState({
            languageName: newLanguageName,
            code: newLanguage.defaultCode,
            output: "",
            stdin: "",
        });
        setStatusText("");
    };

    // Handles running the code by sending it to the backend API.
    const handleRun = async () => {
        setIsLoading(true);
        setStatusText("Submitting...");
        setCodeSolveState(prev => ({ ...prev, output: "" }));

        try {
            const response = await api.post('/judge0/execute', {
                source_code: code,
                language_id: selectedLanguage.id,
                stdin: stdin,
            });

            const resultOutput = response.data;

            // Update status text based on the execution result.
            if (resultOutput.startsWith("Error:") || resultOutput.startsWith("Compile Error:")) {
                setStatusText("Runtime/Compile Error");
            } else if (resultOutput.startsWith("Status:")) {
                setStatusText("Completed with Status");
            } else {
                setStatusText("Success");
            }
            setCodeSolveState(prev => ({ ...prev, output: resultOutput }));

        } catch (err) {
            console.error("Error running code via backend proxy:", err);
            let errorMessage = "❌ Network/Error: Submission failed";
            if (isAxiosError(err) && err.response) {
                errorMessage = `Backend Error: ${err.response.status} - ${err.response.data}`;
            } else if (err instanceof Error) {
                errorMessage = `Frontend Error: ${err.message}`;
            }
            setStatusText(errorMessage);
            setCodeSolveState(prev => ({ ...prev, output: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER ---
    return (
        <section className="h-full w-full flex flex-col p-4 bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
            {/* --- Header / Controls Bar --- */}
            <motion.div
                className="flex-shrink-0 mb-4 bg-white/70 dark:bg-black/30 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-gray-700 p-4 shadow-lg flex flex-wrap items-center justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                        CodeSolve
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Your instant code execution environment.</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 shadow-sm transition-all duration-200"
                        value={languageName}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        {languageOptions.map((lang) => (
                            <option key={lang.id} value={lang.name}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        onClick={handleRun}
                        disabled={isLoading}
                        className="font-bold px-6 py-2.5 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 transition-all rounded-xl shadow-lg text-white transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Running...</span>
                            </>
                        ) : (
                            <>
                                <PlayIcon />
                                <span>Run Code</span>
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* --- Main Content Area (Editor & I/O) --- */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Left Panel: Code Editor */}
                <motion.div
                    className="flex-1 lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-lg p-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                >
                    <div className="flex-1 h-full rounded-xl overflow-hidden">
                        <Editor
                            height="100%"
                            language={languageName.toLowerCase()}
                            value={code}
                            onChange={(value) => setCodeSolveState(prev => ({ ...prev, code: value || "" }))}
                            theme={ "vs-dark" }
                            options={{
                                fontSize: 16,
                                minimap: { enabled: true, scale: 0.8 },
                                scrollBeyondLastLine: false,
                                wordWrap: "on",
                                automaticLayout: true,
                                padding: { top: 20, bottom: 20 },
                            }}
                        />
                    </div>
                </motion.div>

                {/* Right Panel: Input & Output */}
                <motion.div
                    className="flex-1 lg:w-1/3 flex flex-col gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                >
                    {/* Input Panel */}
                    <div className="flex flex-col h-1/3 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-4">
                        <h3 className="text-lg font-bold text-cyan-400 mb-2">Input (stdin)</h3>
                        <textarea
                            id="stdin"
                            className="flex-1 w-full bg-gray-900 text-white font-mono text-sm p-3 rounded-lg resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                            placeholder="Enter input for your program here..."
                            value={stdin}
                            onChange={e => setCodeSolveState(prev => ({ ...prev, stdin: e.target.value }))}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="flex flex-col h-2/3 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-lg font-bold text-cyan-400">Output</h3>
                             <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors
                                ${statusText === "Success" ? "bg-green-500/20 text-green-400" : ""}
                                ${statusText.includes("Error") ? "bg-red-500/20 text-red-400" : ""}
                                ${statusText === "Submitting..." ? "bg-cyan-500/20 text-cyan-400 animate-pulse" : ""}
                                ${statusText === "Completed" ? "bg-blue-500/20 text-blue-400" : ""}
                             `}>
                                 {statusText}
                             </span>
                        </div>
                        <pre
                            ref={outputRef}
                            className="flex-1 w-full bg-gray-900 text-white font-mono text-sm p-3 rounded-lg overflow-auto whitespace-pre-wrap break-words"
                        >
                            {output || (
                                <span className="text-gray-500">Execution output will appear here.</span>
                            )}
                        </pre>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CodeSolve;

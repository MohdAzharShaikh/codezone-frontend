// src/pages/ClickToCode.tsx
import React, { useRef } from 'react';
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api, { isAxiosError } from '@/api/axios';
import clsx from 'clsx';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';

const snippets = [
    // Java
    { name: "Main Class", language: "java", code: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n' },
    { name: "If/Else Statement", language: "java", code: 'if (condition) {\n    // Code if true\n} else {\n    // Code if false\n}\n' },
    { name: "For Loop", language: "java", code: 'for (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}\n' },
    { name: "While Loop", language: "java", code: 'while (condition) {\n    // Loop body\n}\n' },
    { name: "Print to Console", language: "java", code: 'System.out.println("Hello, World!");\n' },
    { name: "Method", language: "java", code: 'public static void myMethod() {\n    // Method body\n}\n' },
    { name: "Class", language: "java", code: 'class MyClass {\n    // Fields and methods here\n}\n' },
    { name: "Try/Catch Block", language: "java", code: 'try {\n    // Code to try\n} catch (Exception e) {\n    // Code to handle exception\n}\n' },
    { name: "Scanner Input", language: "java", code: 'Scanner myObj = new Scanner(System.in);\nSystem.out.println("Enter username");\n\nString userName = myObj.nextLine();\nSystem.out.println("Username is: " + userName);\n' },
    { name: "ArrayList", language: "java", code: 'ArrayList<String> cars = new ArrayList<String>();\n' },
    // Python
    { name: "Main Execution Block", language: "python", code: 'if __name__ == "__main__":\n    # Your code here\n    pass\n' },
    { name: "If/Elif/Else", language: "python", code: 'if condition:\n    # Code if true\nelif another_condition:\n    # Code if another is true\nelse:\n    # Code if false\n' },
    { name: "For Loop", language: "python", code: 'for i in range(5):\n    print(i)\n' },
    { name: "While Loop", language: "python", code: 'while condition:\n    # Loop body\n    pass\n' },
    { name: "Function", language: "python", code: 'def my_function(arg1, arg2):\n    # Function body\n    return arg1 + arg2\n' },
    { name: "Print to Console", language: "python", code: 'print("Hello, World!")\n' },
    { name: "Class", language: "python", code: 'class MyClass:\n  def __init__(self, name):\n    self.name = name\n' },
    { name: "Try/Except Block", language: "python", code: 'try:\n    # Code to try\nexcept Exception as e:\n    print(e)\n' },
    { name: "List Comprehension", language: "python", code: 'squares = [x**2 for x in range(10)]\n' },
    { name: "Dictionary", language: "python", code: 'my_dict = {"key": "value"}\n' },
    // JavaScript
    { name: "If/Else Statement", language: "javascript", code: 'if (condition) {\n  // Code if true\n} else {\n  // Code if false\n}\n' },
    { name: "For Loop", language: "javascript", code: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n' },
    { name: "While Loop", language: "javascript", code: 'while (condition) {\n  // Loop body\n}\n' },
    { name: "Arrow Function", language: "javascript", code: 'const myFunction = (param1, param2) => {\n  // Function body\n  return param1 + param2;\n};\n' },
    { name: "Async Function", language: "javascript", code: 'async function fetchData() {\n  try {\n    const response = await fetch("URL");\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error("Error:", error);\n  }\n}\n' },
    { name: "Log to Console", language: "javascript", code: 'console.log("Hello, World!");\n' },
    { name: "Try/Catch Block", language: "javascript", code: 'try {\n  // Code to try\n} catch (error) {\n  console.error(error);\n}\n' },
    { name: "Map Array", language: "javascript", code: 'const newArray = oldArray.map(element => element * 2);\n' },
    { name: "Filter Array", language: "javascript", code: 'const filteredArray = oldArray.filter(element => element > 10);\n' },
    { name: "EventListener", language: "javascript", code: 'document.getElementById("myBtn").addEventListener("click", () => {\n  // Action on click\n});\n' },
    // C++
    { name: "Main Function", language: "cpp", code: '#include <iostream>\n\nint main() {\n    // Your code here\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n' },
    { name: "If/Else Statement", language: "cpp", code: 'if (condition) {\n    // Code if true\n} else {\n    // Code if false\n}\n' },
    { name: "For Loop", language: "cpp", code: 'for (int i = 0; i < 5; ++i) {\n    std::cout << i << std::endl;\n}\n' },
    { name: "While Loop", language: "cpp", code: 'while (condition) {\n    // Loop body\n}\n' },
    { name: "Function", language: "cpp", code: 'void myFunction(int arg1) {\n    // Function body\n}\n' },
    { name: "Class", language: "cpp", code: 'class MyClass {\npublic:\n    MyClass() { // Constructor\n    \n    }\n};\n' },
    { name: "Vector", language: "cpp", code: '#include <vector>\n\nstd::vector<int> myVector;\n' },
    { name: "Struct", language: "cpp", code: 'struct MyStruct {\n    int myNum;\n    std::string myString;\n};\n' },
    { name: "Pointer", language: "cpp", code: 'int* ptr = &myVariable;\n' },
    { name: "Namespace", language: "cpp", code: 'using namespace std;\n' },
];

const languageSupport: Record<string, number> = {
    java: 62,
    python: 71,
    javascript: 63,
    cpp: 54,
};

const defaultCode: Record<string, string> = {
    java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
    python: '# Start writing your Python code here\n\n',
    javascript: '// Start writing your JavaScript code here\n\n',
    cpp: '#include <iostream>\n\nint main() {\n    \n    return 0;\n}',
};

export default function ClickToCode() {
    const { clickToCodeState, setClickToCodeState } = useAppContext();
    const { code, activeLanguage, output, stdin } = clickToCodeState;
    const [isLoading, setIsLoading] = React.useState(false);
    const editorRef = useRef<any>(null);

    const setCode = (newCode: string) => setClickToCodeState(prev => ({ ...prev, code: newCode }));
    const setOutput = (newOutput: string) => setClickToCodeState(prev => ({ ...prev, output: newOutput }));
    const setStdin = (newStdin: string) => setClickToCodeState(prev => ({ ...prev, stdin: newStdin }));

    const handleLanguageChange = (lang: string) => {
        setClickToCodeState({
            activeLanguage: lang,
            code: defaultCode[lang],
            output: "",
            stdin: "",
        });
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleSnippetClick = (snippet: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.executeEdits("my-source", [{
            range: editor.getSelection(),
            text: snippet,
            forceMoveMarkers: true,
        }]);
        editor.focus();
    };

    const handleRunCode = async () => {
        setIsLoading(true);
        setOutput("Executing...");
        try {
            const response = await api.post('/judge0/execute', {
                source_code: code,
                language_id: languageSupport[activeLanguage],
                stdin: stdin,
            });
            setOutput(response.data || "Execution finished with no output.");
        } catch (err) {
            const errorMsg = isAxiosError(err) && err.response ? `Error: ${err.response.data}` : `Network Error: ${err}`;
            setOutput(errorMsg);
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
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    Click-to-Code
                </h1>
                <p className="text-sm text-slate-500 dark:text-gray-400">Build code logic by clicking on snippets.</p>
            </motion.div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                {/* --- Component Palette (Sidebar) --- */}
                <Card className="w-full md:w-1/4 h-full flex flex-col shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-700 dark:text-white">Code Snippets</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        <div className="space-y-2 mb-6">
                            <h3 className="text-md font-semibold text-slate-600 dark:text-gray-300 mb-2">Select Language</h3>
                            {Object.keys(languageSupport).map(lang => (
                                <Button
                                    key={lang}
                                    variant={activeLanguage === lang ? "default" : "outline"}
                                    className={clsx(
                                        "w-full justify-start", 
                                        activeLanguage === lang ? 'bg-slate-800 text-white' : 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    )}
                                    onClick={() => handleLanguageChange(lang)}
                                >
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </Button>
                            ))}
                        </div>
                        <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                        <div className="space-y-3">
                            {snippets.filter(s => s.language === activeLanguage).map(snippet => (
                                <Button key={snippet.name} variant="outline" className="w-full justify-start dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" onClick={() => handleSnippetClick(snippet.code)}>
                                    {snippet.name}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* --- Main Content: Editor and I/O --- */}
                <div className="flex-1 flex flex-col gap-4 h-full">
                    <Card className="h-3/5 flex flex-col shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-slate-700 dark:text-white">Code Editor</CardTitle>
                            <Button onClick={handleRunCode} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isLoading ? "Running..." : "Run Code"}
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="h-full border rounded-lg overflow-hidden border-gray-300 dark:border-gray-700">
                                <Editor
                                    key={activeLanguage}
                                    height="100%"
                                    language={activeLanguage}
                                    value={code}
                                    onChange={(value) => setCode(value || "")}
                                    onMount={handleEditorDidMount}
                                    theme="vs-dark"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="h-2/5 flex flex-row gap-4">
                        <Card className="w-1/2 flex flex-col shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-700 dark:text-white">Input (stdin)</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <textarea
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                    className="w-full h-full bg-gray-900 text-white text-sm p-4 rounded-lg overflow-y-auto resize-none focus:outline-none focus:ring-2 focus:ring-transparent focus:ring-blue-500"
                                    placeholder="Enter input here..."
                                />
                            </CardContent>
                        </Card>

                        <Card className="w-1/2 flex flex-col shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-700 dark:text-white">Output</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <pre className="h-full bg-gray-900 text-white text-sm p-4 rounded-lg overflow-y-auto">
                                    {output || "Click 'Run Code' to see the output here."}
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

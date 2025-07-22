import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
language?: string;
code: string;
setCode: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
language = "javascript",
code,
setCode,
}) => {
return (
<div className="w-full h-[500px] border border-gray-300 rounded-lg overflow-hidden">
<Editor
height="100%"
defaultLanguage={language}
defaultValue={code}
onChange={(value) => setCode(value || "")}
theme="vs-dark"
options={{
fontSize: 14,
minimap: { enabled: false },
scrollBeyondLastLine: false,
wordWrap: "on",
}}
/>
</div>
);
};

export default CodeEditor;
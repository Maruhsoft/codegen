import React, { useState } from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { TagsIcon as TabsIcon } from 'lucide-react';
import Editor from '@monaco-editor/react';

const CodePreview: React.FC = () => {
  const { generatedProject } = useGenerator();
  const [selectedFile, setSelectedFile] = useState<string>('frontend/src/api/users.ts');

  const fileOptions = generatedProject?.files.map(f => f.path) || [];
  const selectedFileContent = generatedProject?.files.find(f => f.path === selectedFile)?.content || '';
  const selectedFileLanguage = generatedProject?.files.find(f => f.path === selectedFile)?.language || 'typescript';

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg shadow-sm">
      <div className="border-b border-slate-200 dark:border-dark-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TabsIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <h2 className="text-lg font-medium text-slate-800 dark:text-dark-text">Code Preview</h2>
        </div>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-dark-text rounded-md px-2 py-1 text-sm"
        >
          {fileOptions.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>
      
      <div className="h-[500px] overflow-hidden">
        <Editor
          height="100%"
          language={selectedFileLanguage}
          value={selectedFileContent}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
};

export default CodePreview;
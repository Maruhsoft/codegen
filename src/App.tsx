import React from 'react';
import { GeneratorProvider } from './context/GeneratorContext';
import Header from './components/Header';
import SchemaEditor from './components/SchemaEditor';
import ConfigPanel from './components/ConfigPanel';
import ProjectPreview from './components/ProjectPreview';
import CodePreview from './components/CodePreview';
import GenerateButton from './components/GenerateButton';
import { Tooltip } from 'react-tooltip';

function App() {
  return (
    <GeneratorProvider>
      <div className="min-h-screen bg-slate-100 dark:bg-dark-bg flex flex-col transition-colors">
        <Header />
        
        <main className="flex-1 container mx-auto p-6">
          <div className="grid grid-cols-1 gap-8 mb-24">
            {/* Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <SchemaEditor />
              </div>
              <div>
                <ConfigPanel />
              </div>
            </div>
            
            {/* Generate Button */}
            <div className="flex justify-center">
              <GenerateButton />
            </div>
            
            {/* Results Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <ProjectPreview />
              </div>
              <div>
                <CodePreview />
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-slate-800 dark:bg-slate-900 text-slate-400 p-6">
          <div className="container mx-auto text-center">
            <p className="text-sm">
              API-First Code Generator • &copy; {new Date().getFullYear()} • Built with React, TypeScript & Tailwind CSS
            </p>
          </div>
        </footer>

        <Tooltip id="generate-tooltip" place="top">
          Generate code based on your API schema and configuration
        </Tooltip>
        <Tooltip id="download-tooltip" place="top">
          Download the generated project as a ZIP file
        </Tooltip>
      </div>
    </GeneratorProvider>
  );
}

export default App;
import React from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { Cpu, Code, Github, Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode, resetGenerator } = useGenerator();

  return (
    <header className="bg-slate-800 dark:bg-slate-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">CodeGen</h1>
            <p className="text-xs text-slate-400">API-First Code Generator</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-slate-300 hover:text-white transition-colors">
            Docs
          </a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">
            Examples
          </a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">
            Templates
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="text-slate-300 hover:text-white transition-colors p-2"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>
          <button 
            onClick={resetGenerator}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-md flex items-center gap-2"
            data-tooltip-id="new-project-tooltip"
          >
            <Code className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
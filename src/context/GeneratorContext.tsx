import React, { createContext, useContext, useState, useEffect } from 'react';
import { GeneratorConfig, GeneratedProject, InputFormat } from '../types';

interface GeneratorContextType {
  schema: string;
  setSchema: (schema: string) => void;
  schemaFormat: InputFormat;
  setSchemaFormat: (format: InputFormat) => void;
  isValidSchema: boolean;
  setIsValidSchema: (isValid: boolean) => void;
  config: GeneratorConfig;
  setConfig: (config: Partial<GeneratorConfig>) => void;
  generatedProject: GeneratedProject | null;
  setGeneratedProject: (project: GeneratedProject | null) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  errors: string[];
  setErrors: (errors: string[]) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  resetGenerator: () => void;
}

const defaultConfig: GeneratorConfig = {
  frontendFramework: 'react',
  backendFramework: 'express',
  architecture: 'monolith',
  authType: 'jwt',
  generateTests: true,
  generateDocs: true,
  generateDocker: true,
  language: 'typescript',
};

const GeneratorContext = createContext<GeneratorContextType | undefined>(undefined);

export const GeneratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schema, setSchema] = useState<string>('');
  const [schemaFormat, setSchemaFormat] = useState<InputFormat>('json');
  const [isValidSchema, setIsValidSchema] = useState<boolean>(false);
  const [config, setConfigState] = useState<GeneratorConfig>(defaultConfig);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const setConfig = (newConfig: Partial<GeneratorConfig>) => {
    setConfigState({ ...config, ...newConfig });
  };

  const resetGenerator = () => {
    setSchema('');
    setSchemaFormat('json');
    setIsValidSchema(false);
    setConfigState(defaultConfig);
    setGeneratedProject(null);
    setIsGenerating(false);
    setErrors([]);
  };

  return (
    <GeneratorContext.Provider
      value={{
        schema,
        setSchema,
        schemaFormat,
        setSchemaFormat,
        isValidSchema,
        setIsValidSchema,
        config,
        setConfig,
        generatedProject,
        setGeneratedProject,
        isGenerating,
        setIsGenerating,
        errors,
        setErrors,
        isDarkMode,
        toggleDarkMode,
        resetGenerator,
      }}
    >
      {children}
    </GeneratorContext.Provider>
  );
};

export const useGenerator = (): GeneratorContextType => {
  const context = useContext(GeneratorContext);
  if (context === undefined) {
    throw new Error('useGenerator must be used within a GeneratorProvider');
  }
  return context;
};
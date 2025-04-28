import React, { useEffect } from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { InputFormat } from '../types';
import { validateSchema } from '../utils/schemaValidator';
import { Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Tooltip } from 'react-tooltip';

const formatOptions: { value: InputFormat; label: string; description: string }[] = [
  { 
    value: 'json', 
    label: 'JSON Schema',
    description: 'Standard JSON Schema format. Best for strict type definitions and validation rules.'
  },
  { 
    value: 'yaml', 
    label: 'YAML',
    description: 'Human-friendly format with support for comments and complex structures.'
  },
  { 
    value: 'openapi', 
    label: 'OpenAPI 3.1',
    description: 'Industry standard for API documentation. Includes endpoints, schemas, and security definitions.'
  },
  { 
    value: 'dsl', 
    label: 'Custom DSL',
    description: 'Domain-specific language for concise API definitions. Simpler than OpenAPI but less standardized.'
  },
];

const SchemaEditor: React.FC = () => {
  const {
    schema,
    setSchema,
    schemaFormat,
    setSchemaFormat,
    setIsValidSchema,
    errors,
    setErrors,
  } = useGenerator();

  const exampleSchema = JSON.stringify(
    {
      name: 'User API',
      endpoints: [
        {
          name: 'User',
          path: '/users',
          method: 'GET',
          auth: 'jwt',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          response: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        {
          name: 'User',
          path: '/users',
          method: 'POST',
          auth: 'jwt',
          properties: {
            name: { type: 'string', required: true },
            email: { type: 'string', format: 'email', required: true },
            password: { type: 'string', minLength: 8, required: true }
          },
          request: {
            type: 'object',
            properties: {
              name: { type: 'string', required: true },
              email: { type: 'string', format: 'email', required: true },
              password: { type: 'string', minLength: 8, required: true },
            },
          },
          response: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      ],
    },
    null,
    2
  );

  useEffect(() => {
    if (!schema && schemaFormat === 'json') {
      setSchema(exampleSchema);
    }
  }, []);

  useEffect(() => {
    if (schema) {
      const { isValid, errors } = validateSchema(schema, schemaFormat);
      setIsValidSchema(isValid);
      setErrors(errors);
    }
  }, [schema, schemaFormat]);

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSchemaFormat(e.target.value as InputFormat);
  };

  const handleFormat = () => {
    try {
      if (schemaFormat === 'json' || schemaFormat === 'openapi') {
        const formatted = JSON.stringify(JSON.parse(schema), null, 2);
        setSchema(formatted);
      }
    } catch (error) {
      console.error('Failed to format code:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">
          API Schema
          <span 
            className="ml-2 text-sm text-blue-500 cursor-help"
            data-tooltip-id="schema-tooltip"
            data-tooltip-content="Define your API structure using your preferred format. The generator will create corresponding code based on this schema."
          >
            ?
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="format" className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Format:
          </label>
          <select
            id="format"
            value={schemaFormat}
            onChange={handleFormatChange}
            className="bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
            aria-label="Select schema format"
            data-tooltip-id={`format-${schemaFormat}`}
          >
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative">
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button 
            className="bg-slate-700 hover:bg-slate-800 text-white p-1.5 rounded-md flex items-center justify-center transition-colors"
            title="Format code"
            onClick={handleFormat}
          >
            <Code className="h-4 w-4" />
          </button>
        </div>
        
        <div className="border border-slate-300 rounded-md overflow-hidden shadow-sm">
          <Editor
            height="400px"
            defaultLanguage={schemaFormat === 'yaml' ? 'yaml' : 'json'}
            language={schemaFormat === 'yaml' ? 'yaml' : 'json'}
            value={schema}
            onChange={(value) => setSchema(value || '')}
            theme="vs-light"
            options={{
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

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <h3 className="text-sm font-medium text-red-800 mb-1">Validation Errors:</h3>
          <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {formatOptions.map((option) => (
        <Tooltip 
          key={option.value}
          id={`format-${option.value}`}
          content={option.description}
        />
      ))}
    </div>
  );
};

export default SchemaEditor;
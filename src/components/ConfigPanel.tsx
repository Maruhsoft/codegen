import React from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { Architecture, AuthType, BackendFramework, Framework, ApiStyle, WrapperType, DatabaseType, CacheStrategy, HttpClient, StateManagement } from '../types';
import { Settings, Server, Layout, Shield, FileCode, FileJson, Pocket as Docker, TestTube, Database, Workflow, Zap, Archive } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

const ConfigPanel: React.FC = () => {
  const { config, setConfig } = useGenerator();

  const configGroups = [
    {
      title: 'Framework Selection',
      items: [
        {
          label: 'Frontend Framework',
          options: [
            { value: 'react', label: 'React', description: 'Modern, component-based UI library with a rich ecosystem.' },
            { value: 'next', label: 'Next.js', description: 'Full-featured React framework with SSR/SSG capabilities.' },
            { value: 'vue', label: 'Vue', description: 'Progressive framework with gentle learning curve.' },
            { value: 'nuxt', label: 'Nuxt.js', description: 'Vue.js framework with server-side rendering.' },
            { value: 'svelte', label: 'SvelteKit', description: 'Compile-time framework with minimal runtime.' },
            { value: 'vanilla', label: 'Vanilla JS', description: 'Pure JavaScript without frameworks.' },
          ],
          value: config.frontendFramework,
          onChange: (value: Framework) => setConfig({ frontendFramework: value })
        },
        {
          label: 'Backend Framework',
          options: [
            { value: 'express', label: 'Express', description: 'Minimal and flexible Node.js framework.' },
            { value: 'nestjs', label: 'NestJS', description: 'Enterprise-ready framework with Angular-like architecture.' },
            { value: 'fastify', label: 'Fastify', description: 'High-performance Node.js framework.' },
            { value: 'fastapi', label: 'FastAPI', description: 'Modern Python framework with automatic OpenAPI docs.' },
            { value: 'go-fiber', label: 'Go Fiber', description: 'Express-inspired Go web framework.' },
            { value: 'go-gin', label: 'Go Gin', description: 'Popular Go framework with excellent performance.' },
          ],
          value: config.backendFramework,
          onChange: (value: BackendFramework) => setConfig({ backendFramework: value })
        }
      ]
    },
    {
      title: 'API Configuration',
      items: [
        {
          label: 'API Style',
          options: [
            { value: 'rest', label: 'REST', description: 'Traditional RESTful API with HTTP methods and resources.' },
            { value: 'graphql', label: 'GraphQL', description: 'Query language for APIs with flexible data fetching.' },
            { value: 'grpc', label: 'gRPC', description: 'High-performance RPC framework using Protocol Buffers.' },
            { value: 'websocket', label: 'WebSocket', description: 'Real-time bidirectional communication protocol.' },
          ],
          value: config.apiStyle,
          onChange: (value: ApiStyle) => setConfig({ apiStyle: value })
        },
        {
          label: 'Authentication',
          options: [
            { value: 'none', label: 'No Authentication', description: 'Public API without authentication.' },
            { value: 'jwt', label: 'JWT Authentication', description: 'Token-based auth with JWTs.' },
            { value: 'oauth2', label: 'OAuth 2.0', description: 'Industry-standard protocol for authorization.' },
            { value: 'apikey', label: 'API Key', description: 'Simple key-based authentication.' },
          ],
          value: config.authType,
          onChange: (value: AuthType) => setConfig({ authType: value })
        }
      ]
    },
    {
      title: 'Data & State Management',
      items: [
        {
          label: 'Database',
          options: [
            { value: 'postgresql', label: 'PostgreSQL', description: 'Advanced open-source relational database.' },
            { value: 'mongodb', label: 'MongoDB', description: 'Popular NoSQL database for flexible schemas.' },
            { value: 'mysql', label: 'MySQL', description: 'Traditional relational database system.' },
            { value: 'sqlite', label: 'SQLite', description: 'Lightweight file-based database.' },
            { value: 'none', label: 'No Database', description: 'Generate API without database integration.' },
          ],
          value: config.database,
          onChange: (value: DatabaseType) => setConfig({ database: value })
        },
        {
          label: 'State Management',
          options: [
            { value: 'redux', label: 'Redux', description: 'Predictable state container with dev tools.' },
            { value: 'mobx', label: 'MobX', description: 'Simple, scalable state management.' },
            { value: 'zustand', label: 'Zustand', description: 'Small, fast and scalable state management.' },
            { value: 'jotai', label: 'Jotai', description: 'Primitive and flexible state management.' },
            { value: 'none', label: 'No State Management', description: 'Use local state and context only.' },
          ],
          value: config.stateManagement,
          onChange: (value: StateManagement) => setConfig({ stateManagement: value })
        }
      ]
    },
    {
      title: 'Client Integration',
      items: [
        {
          label: 'HTTP Client',
          options: [
            { value: 'axios', label: 'Axios', description: 'Feature-rich HTTP client with wide browser support.' },
            { value: 'fetch', label: 'Fetch API', description: 'Modern browser-native HTTP client.' },
            { value: 'ky', label: 'Ky', description: 'Tiny and elegant HTTP client based on Fetch.' },
            { value: 'superagent', label: 'SuperAgent', description: 'Progressive client-side HTTP client.' },
          ],
          value: config.httpClient,
          onChange: (value: HttpClient) => setConfig({ httpClient: value })
        },
        {
          label: 'API Wrapper',
          options: [
            { value: 'react-query', label: 'React Query', description: 'Powerful data synchronization for React.' },
            { value: 'swr', label: 'SWR', description: 'React Hooks for data fetching.' },
            { value: 'apollo', label: 'Apollo Client', description: 'Complete GraphQL client and cache.' },
            { value: 'urql', label: 'URQL', description: 'Highly customizable GraphQL client.' },
            { value: 'custom', label: 'Custom Wrapper', description: 'Generate a custom API wrapper.' },
          ],
          value: config.wrapperType,
          onChange: (value: WrapperType) => setConfig({ wrapperType: value })
        }
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">Generator Configuration</h2>
      </div>

      {configGroups.map((group, groupIndex) => (
        <div key={group.title} className={`${groupIndex > 0 ? 'mt-8' : ''}`}>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {group.items.map((item) => (
              <div key={item.label}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {item.label}
                  <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id={`${item.label}-tooltip`}>?</span>
                </label>
                <select
                  value={item.value}
                  onChange={(e) => item.onChange(e.target.value as any)}
                  className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
                  data-tooltip-id={`${item.label}-${item.value}`}
                >
                  {item.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <Tooltip id={`${item.label}-${item.value}`} content={item.options.find(o => o.value === item.value)?.description} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'monolith', label: 'Monolith', icon: <Layout />, description: 'Single codebase for all features.' },
            { value: 'microservices', label: 'Microservices', icon: <Server />, description: 'Distributed architecture with independent services.' },
            { value: 'serverless', label: 'Serverless', icon: <FileCode />, description: 'Function-based architecture with automatic scaling.' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setConfig({ architecture: option.value as Architecture })}
              className={`flex items-center justify-center gap-2 p-3 rounded-md border ${
                config.architecture === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-700 dark:text-slate-300'
              }`}
              data-tooltip-id={`arch-${option.value}`}
            >
              {React.cloneElement(option.icon, {
                className: `h-5 w-5 ${
                  config.architecture === option.value
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`
              })}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 dark:border-dark-border pt-6">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Additional Features</h3>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.generateTests}
              onChange={(e) => setConfig({ generateTests: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
              data-tooltip-id="tests-tooltip"
            />
            <div className="flex items-center gap-1.5">
              <TestTube className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Generate Tests</span>
            </div>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.generateDocs}
              onChange={(e) => setConfig({ generateDocs: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
              data-tooltip-id="docs-tooltip"
            />
            <div className="flex items-center gap-1.5">
              <FileJson className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">API Documentation</span>
            </div>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.generateDocker}
              onChange={(e) => setConfig({ generateDocker: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
              data-tooltip-id="docker-tooltip"
            />
            <div className="flex items-center gap-1.5">
              <Docker className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Docker Config</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
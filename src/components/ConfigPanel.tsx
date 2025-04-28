import React from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { Architecture, AuthType, BackendFramework, Framework, ApiStyle, WrapperType, DatabaseType, CacheStrategy } from '../types';
import { Settings, Server, Layout, Shield, FileCode, FileJson, Pocket as Docker, TestTube, Database, Workflow, Zap, Archive } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

const ConfigPanel: React.FC = () => {
  const { config, setConfig } = useGenerator();

  const frontendOptions: { value: Framework; label: string; description: string }[] = [
    { value: 'react', label: 'React', description: 'Modern, component-based UI library with a rich ecosystem.' },
    { value: 'next', label: 'Next.js', description: 'Full-featured React framework with SSR/SSG capabilities.' },
    { value: 'vue', label: 'Vue', description: 'Progressive framework with gentle learning curve.' },
    { value: 'nuxt', label: 'Nuxt.js', description: 'Vue.js framework with server-side rendering.' },
    { value: 'svelte', label: 'SvelteKit', description: 'Compile-time framework with minimal runtime.' },
    { value: 'vanilla', label: 'Vanilla JS', description: 'Pure JavaScript without frameworks.' },
  ];

  const backendOptions: { value: BackendFramework; label: string; description: string }[] = [
    { value: 'express', label: 'Express', description: 'Minimal and flexible Node.js framework.' },
    { value: 'nestjs', label: 'NestJS', description: 'Enterprise-ready framework with Angular-like architecture.' },
    { value: 'fastify', label: 'Fastify', description: 'High-performance Node.js framework.' },
    { value: 'fastapi', label: 'FastAPI', description: 'Modern Python framework with automatic OpenAPI docs.' },
    { value: 'go-fiber', label: 'Go Fiber', description: 'Express-inspired Go web framework.' },
    { value: 'go-gin', label: 'Go Gin', description: 'Popular Go framework with excellent performance.' },
  ];

  const architectureOptions: { value: Architecture; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'monolith', label: 'Monolith', icon: <Layout className="h-5 w-5" />, description: 'Single codebase for all features.' },
    { value: 'microservices', label: 'Microservices', icon: <Server className="h-5 w-5" />, description: 'Distributed architecture with independent services.' },
    { value: 'serverless', label: 'Serverless', icon: <FileCode className="h-5 w-5" />, description: 'Function-based architecture with automatic scaling.' },
  ];

  const authOptions: { value: AuthType; label: string; description: string }[] = [
    { value: 'none', label: 'No Authentication', description: 'Public API without authentication.' },
    { value: 'jwt', label: 'JWT Authentication', description: 'Token-based auth with JWTs.' },
    { value: 'oauth2', label: 'OAuth 2.0', description: 'Industry-standard protocol for authorization.' },
    { value: 'apikey', label: 'API Key', description: 'Simple key-based authentication.' },
  ];

  const apiStyleOptions: { value: ApiStyle; label: string; description: string }[] = [
    { value: 'rest', label: 'REST', description: 'Traditional RESTful API with HTTP methods and resources.' },
    { value: 'graphql', label: 'GraphQL', description: 'Query language for APIs with flexible data fetching.' },
    { value: 'grpc', label: 'gRPC', description: 'High-performance RPC framework using Protocol Buffers.' },
    { value: 'websocket', label: 'WebSocket', description: 'Real-time bidirectional communication protocol.' },
  ];

  const wrapperOptions: { value: WrapperType; label: string; description: string }[] = [
    { value: 'class', label: 'Class Components', description: 'Traditional object-oriented approach with lifecycle methods.' },
    { value: 'functional', label: 'Functional Components', description: 'Modern function-based components with simpler syntax.' },
    { value: 'hooks', label: 'Custom Hooks', description: 'Reusable stateful logic with React Hooks pattern.' },
    { value: 'hoc', label: 'Higher-Order Components', description: 'Component composition pattern for code reuse.' },
  ];

  const databaseOptions: { value: DatabaseType; label: string; description: string }[] = [
    { value: 'postgresql', label: 'PostgreSQL', description: 'Advanced open-source relational database.' },
    { value: 'mongodb', label: 'MongoDB', description: 'Popular NoSQL database for flexible schemas.' },
    { value: 'mysql', label: 'MySQL', description: 'Traditional relational database system.' },
    { value: 'sqlite', label: 'SQLite', description: 'Lightweight file-based database.' },
    { value: 'none', label: 'No Database', description: 'Generate API without database integration.' },
  ];

  const cacheOptions: { value: CacheStrategy; label: string; description: string }[] = [
    { value: 'none', label: 'No Caching', description: 'Direct database queries without caching.' },
    { value: 'redis', label: 'Redis', description: 'In-memory data store for high-performance caching.' },
    { value: 'memory', label: 'In-Memory', description: 'Simple in-process memory cache.' },
    { value: 'filesystem', label: 'File System', description: 'Disk-based caching for persistence.' },
  ];

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">Generator Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Frontend Framework
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="frontend-tooltip">?</span>
          </label>
          <select
            value={config.frontendFramework}
            onChange={(e) => setConfig({ frontendFramework: e.target.value as Framework })}
            className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
            data-tooltip-id={`framework-${config.frontendFramework}`}
          >
            {frontendOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Tooltip id={`framework-${config.frontendFramework}`} content={frontendOptions.find(o => o.value === config.frontendFramework)?.description} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Backend Framework
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="backend-tooltip">?</span>
          </label>
          <select
            value={config.backendFramework}
            onChange={(e) => setConfig({ backendFramework: e.target.value as BackendFramework })}
            className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
            data-tooltip-id={`backend-${config.backendFramework}`}
          >
            {backendOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Tooltip id={`backend-${config.backendFramework}`} content={backendOptions.find(o => o.value === config.backendFramework)?.description} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            API Style
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="api-style-tooltip">?</span>
          </label>
          <select
            value={config.apiStyle}
            onChange={(e) => setConfig({ apiStyle: e.target.value as ApiStyle })}
            className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
            data-tooltip-id={`api-style-${config.apiStyle}`}
          >
            {apiStyleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Tooltip id={`api-style-${config.apiStyle}`} content={apiStyleOptions.find(o => o.value === config.apiStyle)?.description} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Component Wrapper
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="wrapper-tooltip">?</span>
          </label>
          <select
            value={config.wrapperType}
            onChange={(e) => setConfig({ wrapperType: e.target.value as WrapperType })}
            className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
            data-tooltip-id={`wrapper-${config.wrapperType}`}
          >
            {wrapperOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Tooltip id={`wrapper-${config.wrapperType}`} content={wrapperOptions.find(o => o.value === config.wrapperType)?.description} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Database
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="database-tooltip">?</span>
          </label>
          <select
            value={config.database}
            onChange={(e) => setConfig({ database: e.target.value as DatabaseType })}
            className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
            data-tooltip-id={`database-${config.database}`}
          >
            {databaseOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Tooltip id={`database-${config.database}`} content={databaseOptions.find(o => o.value === config.database)?.description} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Caching Strategy
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="cache-tooltip">?</span>
          </label>
          <select
            value={config.caching}
            onChange={(e) => setConfig({ caching: e.target.value as CacheStrategy })}
            className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
            data-tooltip-id={`cache-${config.caching}`}
          >
            {cacheOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Tooltip id={`cache-${config.caching}`} content={cacheOptions.find(o => o.value === config.caching)?.description} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Language
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="language-tooltip">?</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="typescript"
                checked={config.language === 'typescript'}
                onChange={() => setConfig({ language: 'typescript' })}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">TypeScript</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="javascript"
                checked={config.language === 'javascript'}
                onChange={() => setConfig({ language: 'javascript' })}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">JavaScript</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Authentication
            <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="auth-tooltip">?</span>
          </label>
          <select
            value={config.authType}
            onChange={(e) => setConfig({ authType: e.target.value as AuthType })}
            className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-md px-3 py-2"
            data-tooltip-id={`auth-${config.authType}`}
          >
            {authOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Tooltip id={`auth-${config.authType}`} content={authOptions.find(o => o.value === config.authType)?.description} />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Architecture
          <span className="ml-1 text-blue-500 cursor-help" data-tooltip-id="architecture-tooltip">?</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {architectureOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setConfig({ architecture: option.value })}
              className={`flex items-center justify-center gap-2 p-3 rounded-md border ${
                config.architecture === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-700 dark:text-slate-300'
              }`}
              data-tooltip-id={`arch-${option.value}`}
            >
              {React.cloneElement(option.icon as React.ReactElement, {
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
        {architectureOptions.map((option) => (
          <Tooltip key={option.value} id={`arch-${option.value}`} content={option.description} />
        ))}
      </div>

      <div className="mt-6 border-t border-slate-200 dark:border-dark-border pt-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Additional Options</h3>
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
          <Tooltip id="tests-tooltip" content="Generates unit tests for components and API endpoints." />
          
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
          <Tooltip id="docs-tooltip" content="Creates OpenAPI/Swagger documentation for your API endpoints." />
          
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
          <Tooltip id="docker-tooltip" content="Generates Dockerfile and docker-compose.yml for containerized deployment." />
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
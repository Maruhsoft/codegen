import React from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { Architecture, AuthType, BackendFramework, Framework } from '../types';
import { Settings, Server, Layout, Shield, FileCode, FileJson, Pocket as Docker, TestTube } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

const ConfigPanel: React.FC = () => {
  const { config, setConfig } = useGenerator();

  const frontendOptions: { value: Framework; label: string; description: string }[] = [
    { 
      value: 'react', 
      label: 'React',
      description: 'Modern, component-based UI library with a rich ecosystem. Best for dynamic single-page applications.'
    },
    { 
      value: 'next', 
      label: 'Next.js',
      description: 'Full-featured React framework with SSR/SSG capabilities. Ideal for SEO-critical applications.'
    },
    { 
      value: 'vue', 
      label: 'Vue',
      description: 'Progressive framework with gentle learning curve. Great for both small and large applications.'
    },
    { 
      value: 'nuxt', 
      label: 'Nuxt.js',
      description: 'Vue.js framework with server-side rendering. Perfect for content-heavy applications.'
    },
    { 
      value: 'svelte', 
      label: 'SvelteKit',
      description: 'Compile-time framework with minimal runtime. Excellent for performance-critical applications.'
    },
    { 
      value: 'vanilla', 
      label: 'Vanilla JS',
      description: 'Pure JavaScript without frameworks. Best for lightweight applications or when bundle size is critical.'
    },
  ];

  const backendOptions: { value: BackendFramework; label: string; description: string }[] = [
    { 
      value: 'express', 
      label: 'Express',
      description: 'Minimal and flexible Node.js framework. Perfect for simple to moderate complexity APIs.'
    },
    { 
      value: 'nestjs', 
      label: 'NestJS',
      description: 'Enterprise-ready framework with Angular-like architecture. Ideal for large-scale applications.'
    },
    { 
      value: 'fastify', 
      label: 'Fastify',
      description: 'High-performance Node.js framework. Best when speed and low overhead are priorities.'
    },
    { 
      value: 'fastapi', 
      label: 'FastAPI (Python)',
      description: 'Modern Python framework with automatic OpenAPI docs. Great for data-heavy applications.'
    },
    { 
      value: 'go-fiber', 
      label: 'Go Fiber',
      description: 'Express-inspired Go web framework. Excellent for high-concurrency applications.'
    },
    { 
      value: 'go-gin', 
      label: 'Go Gin',
      description: 'Popular Go framework with excellent performance. Perfect for microservices.'
    },
  ];

  const architectureOptions: { value: Architecture; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'monolith', 
      label: 'Monolith', 
      icon: <Layout className="h-5 w-5" />,
      description: 'Single codebase for all features. Best for small to medium projects or rapid development.'
    },
    { 
      value: 'microservices', 
      label: 'Microservices', 
      icon: <Server className="h-5 w-5" />,
      description: 'Distributed architecture with independent services. Ideal for large, scalable applications.'
    },
    { 
      value: 'serverless', 
      label: 'Serverless', 
      icon: <FileCode className="h-5 w-5" />,
      description: 'Function-based architecture with automatic scaling. Perfect for variable workloads.'
    },
  ];

  const authOptions: { value: AuthType; label: string; description: string }[] = [
    { 
      value: 'none', 
      label: 'No Authentication',
      description: 'Public API without authentication. Suitable for open data or static content.'
    },
    { 
      value: 'jwt', 
      label: 'JWT Authentication',
      description: 'Token-based auth with JWTs. Best for stateless authentication in modern web apps.'
    },
    { 
      value: 'oauth2', 
      label: 'OAuth 2.0',
      description: 'Industry-standard protocol for authorization. Ideal for third-party integrations.'
    },
    { 
      value: 'apikey', 
      label: 'API Key',
      description: 'Simple key-based authentication. Good for B2B APIs or internal services.'
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-slate-600" />
        <h2 className="text-lg font-medium text-slate-800">Generator Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Frontend Framework
            <span 
              className="ml-1 text-blue-500 cursor-help"
              data-tooltip-id="frontend-tooltip"
              data-tooltip-content="Choose the UI framework that best suits your project's needs"
            >
              ?
            </span>
          </label>
          <select
            value={config.frontendFramework}
            onChange={(e) => setConfig({ frontendFramework: e.target.value as Framework })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-tooltip-id={`framework-${config.frontendFramework}`}
          >
            {frontendOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Tooltip 
            id={`framework-${config.frontendFramework}`}
            content={frontendOptions.find(o => o.value === config.frontendFramework)?.description}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Backend Framework
            <span 
              className="ml-1 text-blue-500 cursor-help"
              data-tooltip-id="backend-tooltip"
              data-tooltip-content="Select the server framework based on your performance and scalability requirements"
            >
              ?
            </span>
          </label>
          <select
            value={config.backendFramework}
            onChange={(e) => setConfig({ backendFramework: e.target.value as BackendFramework })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-tooltip-id={`backend-${config.backendFramework}`}
          >
            {backendOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Tooltip 
            id={`backend-${config.backendFramework}`}
            content={backendOptions.find(o => o.value === config.backendFramework)?.description}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Language
            <span 
              className="ml-1 text-blue-500 cursor-help"
              data-tooltip-id="language-tooltip"
              data-tooltip-content="TypeScript adds static typing and better tooling support, while JavaScript offers more flexibility"
            >
              ?
            </span>
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
              <span className="ml-2 text-sm text-slate-700">TypeScript</span>
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
              <span className="ml-2 text-sm text-slate-700">JavaScript</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Authentication
            <span 
              className="ml-1 text-blue-500 cursor-help"
              data-tooltip-id="auth-tooltip"
              data-tooltip-content="Choose the authentication method based on your security requirements"
            >
              ?
            </span>
          </label>
          <select
            value={config.authType}
            onChange={(e) => setConfig({ authType: e.target.value as AuthType })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-tooltip-id={`auth-${config.authType}`}
          >
            {authOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Tooltip 
            id={`auth-${config.authType}`}
            content={authOptions.find(o => o.value === config.authType)?.description}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Architecture
          <span 
            className="ml-1 text-blue-500 cursor-help"
            data-tooltip-id="architecture-tooltip"
            data-tooltip-content="Choose the application architecture that matches your scalability needs"
          >
            ?
          </span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {architectureOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setConfig({ architecture: option.value })}
              className={`flex items-center justify-center gap-2 p-3 rounded-md border ${
                config.architecture === option.value
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
              data-tooltip-id={`arch-${option.value}`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        {architectureOptions.map((option) => (
          <Tooltip 
            key={option.value}
            id={`arch-${option.value}`}
            content={option.description}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Additional Options</h3>
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
              <TestTube className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700">Generate Tests</span>
            </div>
          </label>
          <Tooltip 
            id="tests-tooltip"
            content="Generates unit tests for components and API endpoints. Includes Jest setup and example tests."
          />
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.generateDocs}
              onChange={(e) => setConfig({ generateDocs: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
              data-tooltip-id="docs-tooltip"
            />
            <div className="flex items-center gap-1.5">
              <FileJson className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700">API Documentation</span>
            </div>
          </label>
          <Tooltip 
            id="docs-tooltip"
            content="Creates OpenAPI/Swagger documentation for your API endpoints. Includes interactive API explorer."
          />
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.generateDocker}
              onChange={(e) => setConfig({ generateDocker: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
              data-tooltip-id="docker-tooltip"
            />
            <div className="flex items-center gap-1.5">
              <Docker className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700">Docker Config</span>
            </div>
          </label>
          <Tooltip 
            id="docker-tooltip"
            content="Generates Dockerfile and docker-compose.yml for containerized deployment. Includes development and production configurations."
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
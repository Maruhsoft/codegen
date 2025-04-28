import { GeneratorConfig, GeneratedFile, ProjectStructure, Framework, ApiStyle } from '../types';
import * as yaml from 'js-yaml';

// Helper function to generate project structure
const generateProjectStructure = (files: GeneratedFile[]): ProjectStructure => {
  const root: ProjectStructure = {
    name: 'root',
    type: 'directory',
    path: '',
    children: []
  };

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // File
        current.children = current.children || [];
        current.children.push({
          name: part,
          type: 'file',
          path: file.path,
          language: file.language
        });
      } else {
        // Directory
        current.children = current.children || [];
        let dir = current.children.find(
          child => child.type === 'directory' && child.name === part
        );
        if (!dir) {
          dir = {
            name: part,
            type: 'directory',
            path: parts.slice(0, index + 1).join('/'),
            children: []
          };
          current.children.push(dir);
        }
        current = dir;
      }
    });
  });

  return root;
};

// Helper function to generate common files
const generateCommonFiles = (config: GeneratorConfig): GeneratedFile[] => {
  return [
    {
      path: 'package.json',
      content: generatePackageJson(config),
      language: 'json'
    },
    {
      path: 'tsconfig.json',
      content: generateTsConfig(config),
      language: 'json'
    },
    {
      path: '.env',
      content: generateEnvFile(config),
      language: 'text'
    }
  ];
};

// Helper function to generate package.json
const generatePackageJson = (config: GeneratorConfig): string => {
  const dependencies: { [key: string]: string } = {
    [config.frontendFramework]: '^18.0.0',
    typescript: '^4.9.0',
  };

  if (config.httpClient === 'axios') dependencies.axios = '^1.3.0';
  if (config.wrapperType === 'react-query') dependencies['@tanstack/react-query'] = '^4.0.0';
  if (config.wrapperType === 'swr') dependencies.swr = '^2.0.0';

  return JSON.stringify({
    name: 'generated-project',
    version: '1.0.0',
    private: true,
    dependencies,
    devDependencies: {
      '@types/node': '^18.0.0',
      '@types/react': '^18.0.0',
      'typescript': '^4.9.0'
    }
  }, null, 2);
};

// Helper function to generate API client
const generateApiClient = (config: GeneratorConfig): string => {
  const imports = [];
  const clientCode = [];

  if (config.httpClient === 'axios') {
    imports.push("import axios from 'axios';");
    clientCode.push(`
const client = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});`);
  } else {
    clientCode.push(`
const client = {
  baseURL: process.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
};`);
  }

  return `${imports.join('\n')}\n${clientCode.join('\n')}`;
};

// Helper function to generate API endpoint
const generateApiEndpoint = (endpoint: any, config: GeneratorConfig): string => {
  const method = endpoint.method.toLowerCase();
  const name = endpoint.name;
  
  return `
import { client } from '../client';
import { ${name}Request, ${name}Response } from '../../types/api/${getEndpointFileName(endpoint)}';

export const ${method}${name} = async (${method !== 'get' ? 'data: ' + name + 'Request' : ''}) => {
  const response = await client.${method}${method !== 'get' ? '(data)' : '()'};
  return response.data as ${name}Response;
};`;
};

// Helper function to generate React Query hook
const generateReactQueryHook = (endpoint: any, config: GeneratorConfig): string => {
  const method = endpoint.method.toLowerCase();
  const name = endpoint.name;
  
  return `
import { useQuery, useMutation } from '@tanstack/react-query';
import { ${method}${name} } from '../endpoints/${getEndpointFileName(endpoint)}';

export const use${name}${method.charAt(0).toUpperCase() + method.slice(1)} = () => {
  ${method === 'get' 
    ? `return useQuery(['${name}'], () => ${method}${name}());`
    : `return useMutation((data) => ${method}${name}(data));`
  }
};`;
};

// Helper function to generate SWR hook
const generateSwrHook = (endpoint: any, config: GeneratorConfig): string => {
  const method = endpoint.method.toLowerCase();
  const name = endpoint.name;
  
  return `
import useSWR from 'swr';
import { ${method}${name} } from '../endpoints/${getEndpointFileName(endpoint)}';

export const use${name}${method.charAt(0).toUpperCase() + method.slice(1)} = () => {
  return useSWR('${name}', ${method}${name});
};`;
};

// Helper function to generate API types
const generateApiTypes = (schema: any): string => {
  return `
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}`;
};

// Helper function to generate endpoint types
const generateEndpointTypes = (endpoint: any): string => {
  const name = endpoint.name;
  
  return `
export interface ${name}Request {
  ${Object.entries(endpoint.properties || {})
    .map(([key, value]: [string, any]) => `${key}: ${value.type};`)
    .join('\n  ')}
}

export interface ${name}Response {
  ${Object.entries(endpoint.response?.properties || {})
    .map(([key, value]: [string, any]) => `${key}: ${value.type};`)
    .join('\n  ')}
}`;
};

// Helper function to generate monolith server
const generateMonolithServer = (config: GeneratorConfig): string => {
  return `
import express from 'express';
import cors from 'cors';
import { routes } from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

export default app;`;
};

// Helper function to generate monolith route
const generateMonolithRoute = (endpoint: any, config: GeneratorConfig): string => {
  const method = endpoint.method.toLowerCase();
  const name = endpoint.name;
  
  return `
import { Router } from 'express';
import { ${name}Controller } from '../controllers/${getEndpointFileName(endpoint)}.controller';

const router = Router();
router.${method}('/${name.toLowerCase()}', ${name}Controller.${method});

export default router;`;
};

// Helper function to generate gateway
const generateGateway = (config: GeneratorConfig): string => {
  return `
import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app = express();

app.use(cors());
app.use(express.json());

// Add service proxies here

export default app;`;
};

// Helper function to generate microservice handler
const generateMicroserviceHandler = (endpoint: any, config: GeneratorConfig): string => {
  const method = endpoint.method.toLowerCase();
  const name = endpoint.name;
  
  return `
import { ${name}Service } from '../services/${getEndpointFileName(endpoint)}.service';

export const handle${name}${method.charAt(0).toUpperCase() + method.slice(1)} = async (event) => {
  const service = new ${name}Service();
  return service.${method}(event);
};`;
};

// Helper function to generate service types
const generateServiceTypes = (endpoint: any): string => {
  const name = endpoint.name;
  
  return `
export interface ${name}Event {
  body?: string;
  headers: Record<string, string>;
  method: string;
}

export interface ${name}Response {
  statusCode: number;
  body: string;
}`;
};

// Helper function to generate service tests
const generateServiceTests = (endpoint: any): string => {
  const method = endpoint.method.toLowerCase();
  const name = endpoint.name;
  
  return `
import { handle${name}${method.charAt(0).toUpperCase() + method.slice(1)} } from '../handlers/${getEndpointFileName(endpoint)}.handler';

describe('${name} Handler', () => {
  it('should handle the request successfully', async () => {
    const event = {
      method: '${method.toUpperCase()}',
      headers: {},
      body: '{}'
    };

    const response = await handle${name}${method.charAt(0).toUpperCase() + method.slice(1)}(event);
    expect(response.statusCode).toBe(200);
  });
});`;
};

// Helper function to generate serverless function
const generateServerlessFunction = (endpoint: any, config: GeneratorConfig): string => {
  const method = endpoint.method.toLowerCase();
  const name = endpoint.name;
  
  return `
export const handler = async (event) => {
  try {
    // Implementation
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};`;
};

// Helper function to generate test files
const generateTestFiles = (schema: any, config: GeneratorConfig): GeneratedFile[] => {
  return schema.endpoints.map((endpoint: any) => ({
    path: `tests/${getEndpointFileName(endpoint)}.test.ts`,
    content: generateServiceTests(endpoint),
    language: 'typescript'
  }));
};

// Helper function to generate documentation files
const generateDocFiles = (schema: any, config: GeneratorConfig): GeneratedFile[] => {
  return [{
    path: 'docs/api.md',
    content: generateApiDocs(schema),
    language: 'markdown'
  }];
};

// Helper function to generate Docker files
const generateDockerFiles = (config: GeneratorConfig): GeneratedFile[] => {
  return [
    {
      path: 'Dockerfile',
      content: generateDockerfile(config),
      language: 'dockerfile'
    },
    {
      path: 'docker-compose.yml',
      content: generateDockerCompose(config),
      language: 'yaml'
    }
  ];
};

// Helper function to generate API documentation
const generateApiDocs = (schema: any): string => {
  return `# API Documentation\n\n${schema.endpoints.map((endpoint: any) => `
## ${endpoint.name}

- Method: ${endpoint.method}
- Path: ${endpoint.path}

### Request
\`\`\`json
${JSON.stringify(endpoint.request || {}, null, 2)}
\`\`\`

### Response
\`\`\`json
${JSON.stringify(endpoint.response || {}, null, 2)}
\`\`\`
`).join('\n')}`;
};

// Helper function to generate Dockerfile
const generateDockerfile = (config: GeneratorConfig): string => {
  return `
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]`;
};

// Helper function to generate docker-compose.yml
const generateDockerCompose = (config: GeneratorConfig): string => {
  return `
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`;
};

// Helper function to generate tsconfig.json
const generateTsConfig = (config: GeneratorConfig): string => {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }]
  }, null, 2);
};

// Helper function to generate .env file
const generateEnvFile = (config: GeneratorConfig): string => {
  return `
VITE_API_URL=http://localhost:3000
NODE_ENV=development`;
};

export const generateProject = async (
  schema: string,
  schemaFormat: string,
  config: GeneratorConfig
): Promise<{ files: GeneratedFile[]; structure: ProjectStructure }> => {
  // Parse and normalize schema
  const parsedSchema = parseSchema(schema, schemaFormat);
  
  // Generate files based on configuration
  const files = await generateFiles(parsedSchema, config);
  
  // Generate project structure
  const structure = generateProjectStructure(files);
  
  return { files, structure };
};

const parseSchema = (schema: string, format: string): any => {
  try {
    if (format === 'yaml') {
      return yaml.load(schema);
    } else if (format === 'json' || format === 'openapi') {
      return JSON.parse(schema);
    } else if (format === 'dsl') {
      return parseDSL(schema);
    }
    throw new Error('Unsupported schema format');
  } catch (error) {
    throw new Error(`Failed to parse schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const parseDSL = (schema: string): any => {
  // Simple DSL parser implementation
  const lines = schema.split('\n');
  const endpoints: any[] = [];
  let currentEndpoint: any = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;

    if (trimmedLine.startsWith('endpoint')) {
      if (currentEndpoint) endpoints.push(currentEndpoint);
      currentEndpoint = { properties: {} };
      const match = trimmedLine.match(/endpoint\s+(\w+)\s*{/);
      if (match) currentEndpoint.name = match[1];
    } else if (trimmedLine.startsWith('}') && currentEndpoint) {
      endpoints.push(currentEndpoint);
      currentEndpoint = null;
    } else if (currentEndpoint && trimmedLine.includes(':')) {
      const [key, value] = trimmedLine.split(':').map(s => s.trim());
      currentEndpoint[key] = value;
    }
  });

  return { endpoints };
};

const generateFiles = async (schema: any, config: GeneratorConfig): Promise<GeneratedFile[]> => {
  const files: GeneratedFile[] = [];

  // Common configuration files
  files.push(...generateCommonFiles(config));
  
  // Frontend files
  files.push(...generateFrontendFiles(schema, config));
  
  // Backend files based on architecture
  if (config.architecture === 'monolith') {
    files.push(...generateMonolithFiles(schema, config));
  } else if (config.architecture === 'microservices') {
    files.push(...generateMicroservicesFiles(schema, config));
  } else {
    files.push(...generateServerlessFiles(schema, config));
  }

  // Additional files based on configuration
  if (config.generateTests) {
    files.push(...generateTestFiles(schema, config));
  }
  if (config.generateDocs) {
    files.push(...generateDocFiles(schema, config));
  }
  if (config.generateDocker) {
    files.push(...generateDockerFiles(config));
  }

  return files;
};
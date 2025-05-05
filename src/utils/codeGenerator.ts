import { GeneratorConfig, GeneratedFile, ProjectStructure, Framework, ApiStyle, Architecture } from '../types';
import * as yaml from 'js-yaml';

// Constants for code generation
const INDENT = '  ';
const LINE_ENDING = '\n';

interface ParsedEndpoint {
  name: string;
  method: string;
  path: string;
  auth?: string;
  properties: Record<string, any>;
  request?: Record<string, any>;
  response?: Record<string, any>;
}

interface ParsedSchema {
  name: string;
  endpoints: ParsedEndpoint[];
}

// Generate package.json content
const generatePackageJson = (config: GeneratorConfig): string => {
  const dependencies: Record<string, string> = {
    [config.httpClient]: '^1.0.0',
  };

  if (config.stateManagement !== 'none') {
    dependencies[config.stateManagement] = '^1.0.0';
  }

  if (config.wrapperType !== 'custom') {
    dependencies[config.wrapperType] = '^1.0.0';
  }

  return JSON.stringify({
    name: 'generated-api-project',
    version: '1.0.0',
    private: true,
    dependencies,
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^18.0.0'
    }
  }, null, 2);
};

// Generate tsconfig.json content
const generateTsConfig = (config: GeneratorConfig): string => {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'node',
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      jsx: 'react-jsx',
      baseUrl: '.',
      paths: {
        '@/*': ['src/*']
      }
    },
    include: ['src'],
    exclude: ['node_modules']
  }, null, 2);
};

// Generate .env file content
const generateEnvFile = (config: GeneratorConfig): string => {
  return `API_URL=http://localhost:3000
${config.database !== 'none' ? `DATABASE_URL=postgresql://user:password@localhost:5432/db` : ''}
${config.authType !== 'none' ? `JWT_SECRET=your-secret-key` : ''}`;
};

// Generate README.md content
const generateReadme = (config: GeneratorConfig, schema: ParsedSchema): string => {
  return `# ${schema.name}

## Overview
Generated API project using ${config.frontendFramework} and ${config.backendFramework}.

## Architecture
${config.architecture} architecture with ${config.apiStyle} API style.

## Features
- Authentication: ${config.authType}
- Database: ${config.database}
- State Management: ${config.stateManagement}
- API Client: ${config.httpClient}
${config.generateTests ? '- Includes tests\n' : ''}
${config.generateDocs ? '- Includes documentation\n' : ''}
${config.generateDocker ? '- Includes Docker configuration\n' : ''}

## Getting Started
1. Install dependencies: \`npm install\`
2. Start the development server: \`npm run dev\`

## API Endpoints
${schema.endpoints.map(endpoint => (
  `- ${endpoint.method} ${endpoint.path} - ${endpoint.name}`
)).join('\n')}`;
};

// Generate API client
const generateApiClient = (config: GeneratorConfig): string => {
  const clientCode = `import { ${config.httpClient} } from '${config.httpClient}';

export const apiClient = ${config.httpClient}.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
};`;

  return clientCode;
};

// Generate API endpoint
const generateApiEndpoint = (endpoint: ParsedEndpoint, config: GeneratorConfig): string => {
  const { name, method, path } = endpoint;
  
  return `import { apiClient } from '../client';
import { ${name}Request, ${name}Response } from '../../../types/api/${name.toLowerCase()}';

export const ${method.toLowerCase()}${name} = async (${method === 'GET' ? 'params?: any' : 'data: ' + name + 'Request'}) => {
  const response = await apiClient.${method.toLowerCase()}<${name}Response>('${path}'${method === 'GET' ? ', { params }' : ', data'});
  return response.data;
};`;
};

// Generate endpoint types
const generateEndpointTypes = (endpoint: ParsedEndpoint): string => {
  const { name, request, response } = endpoint;
  
  return `export interface ${name}Request {
${Object.entries(request?.properties || {}).map(([key, value]) => 
  `  ${key}: ${(value as any).type};`
).join('\n')}
}

export interface ${name}Response {
${Object.entries(response?.properties || {}).map(([key, value]) => 
  `  ${key}: ${(value as any).type};`
).join('\n')}
}`;
};

// Generate React Query hook
const generateReactQueryHook = (endpoint: ParsedEndpoint, config: GeneratorConfig): string => {
  const { name, method } = endpoint;
  
  return `import { useQuery, useMutation } from '@tanstack/react-query';
import { ${method.toLowerCase()}${name} } from '../../lib/api/endpoints/${name.toLowerCase()}';
import type { ${name}Request, ${name}Response } from '../../types/api/${name.toLowerCase()}';

${method === 'GET' ? `
export const use${name} = (params?: any) => {
  return useQuery<${name}Response>(['${name.toLowerCase()}', params], () => ${method.toLowerCase()}${name}(params));
};` : `
export const use${method}${name} = () => {
  return useMutation<${name}Response, Error, ${name}Request>(${method.toLowerCase()}${name});
};`}`;
};

// Generate SWR hook
const generateSwrHook = (endpoint: ParsedEndpoint, config: GeneratorConfig): string => {
  const { name, method } = endpoint;
  
  return `import useSWR from 'swr';
import { ${method.toLowerCase()}${name} } from '../../lib/api/endpoints/${name.toLowerCase()}';
import type { ${name}Response } from '../../types/api/${name.toLowerCase()}';

export const use${name} = (params?: any) => {
  return useSWR<${name}Response>(['${name.toLowerCase()}', params], () => ${method.toLowerCase()}${name}(params));
};`;
};

// Generate API types
const generateApiTypes = (schema: ParsedSchema): string => {
  return `export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
}`;
};

// Generate project structure
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
        let child = current.children.find(c => c.name === part && c.type === 'directory');
        
        if (!child) {
          child = {
            name: part,
            type: 'directory',
            path: parts.slice(0, index + 1).join('/'),
            children: []
          };
          current.children.push(child);
        }
        
        current = child;
      }
    });
  });

  return root;
};

// Export the main function
export const generateProject = async (
  schema: string,
  schemaFormat: string,
  config: GeneratorConfig
): Promise<{ files: GeneratedFile[]; structure: ProjectStructure }> => {
  // Parse and normalize schema
  const parsedSchema = parseSchema(schema, schemaFormat);
  
  // Generate files based on configuration
  const files = [
    ...generateCommonFiles(config, parsedSchema),
    ...generateFrontendFiles(parsedSchema, config),
    ...generateBackendFiles(parsedSchema, config),
    ...(config.generateTests ? generateTestFiles(parsedSchema, config) : []),
    ...(config.generateDocs ? generateDocFiles(parsedSchema, config) : []),
    ...(config.generateDocker ? generateDockerFiles(config) : [])
  ];
  
  // Generate project structure
  const structure = generateProjectStructure(files);
  
  return { files, structure };
};

// Helper function to get endpoint filename
const getEndpointFileName = (endpoint: ParsedEndpoint): string => {
  return `${endpoint.method.toLowerCase()}-${endpoint.name.toLowerCase()}`;
};

// Helper function to generate common files
const generateCommonFiles = (config: GeneratorConfig, schema: ParsedSchema): GeneratedFile[] => {
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
    },
    {
      path: 'README.md',
      content: generateReadme(config, schema),
      language: 'markdown'
    }
  ];
};

// Helper function to generate frontend files
const generateFrontendFiles = (schema: ParsedSchema, config: GeneratorConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // Generate API client
  files.push({
    path: 'src/lib/api/client.ts',
    content: generateApiClient(config),
    language: 'typescript'
  });

  // Generate endpoints
  schema.endpoints.forEach(endpoint => {
    files.push({
      path: `src/lib/api/endpoints/${getEndpointFileName(endpoint)}.ts`,
      content: generateApiEndpoint(endpoint, config),
      language: 'typescript'
    });

    files.push({
      path: `src/types/api/${getEndpointFileName(endpoint)}.ts`,
      content: generateEndpointTypes(endpoint),
      language: 'typescript'
    });

    if (config.wrapperType === 'react-query') {
      files.push({
        path: `src/hooks/api/${getEndpointFileName(endpoint)}.ts`,
        content: generateReactQueryHook(endpoint, config),
        language: 'typescript'
      });
    } else if (config.wrapperType === 'swr') {
      files.push({
        path: `src/hooks/api/${getEndpointFileName(endpoint)}.ts`,
        content: generateSwrHook(endpoint, config),
        language: 'typescript'
      });
    }
  });

  files.push({
    path: 'src/types/api/common.ts',
    content: generateApiTypes(schema),
    language: 'typescript'
  });

  return files;
};

// Helper function to generate backend files
const generateBackendFiles = (schema: ParsedSchema, config: GeneratorConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [];
  const ext = config.language === 'typescript' ? 'ts' : 'js';

  // Add database schema
  if (config.database !== 'none') {
    files.push({
      path: `src/database/schema.${config.database === 'mongodb' ? ext : 'sql'}`,
      content: generateDatabaseSchema(schema, config),
      language: config.database === 'mongodb' ? config.language : 'sql'
    });
  }

  // Add backend files based on architecture
  switch (config.architecture) {
    case 'monolith':
      files.push({
        path: `src/server/index.${ext}`,
        content: generateMonolithServer(config),
        language: config.language
      });

      // Add route handlers
      schema.endpoints.forEach(endpoint => {
        files.push({
          path: `src/server/handlers/${endpoint.method.toLowerCase()}-${endpoint.name.toLowerCase()}.${ext}`,
          content: generateRouteHandler(endpoint, config),
          language: config.language
        });
      });
      break;

    case 'microservices':
      files.push({
        path: `src/gateway/index.${ext}`,
        content: generateGateway(config),
        language: config.language
      });

      // Group endpoints by resource
      const resourceGroups = schema.endpoints.reduce((groups, endpoint) => {
        const resource = endpoint.path.split('/')[1];
        if (!groups[resource]) groups[resource] = [];
        groups[resource].push(endpoint);
        return groups;
      }, {} as Record<string, ParsedEndpoint[]>);

      // Generate service files
      Object.entries(resourceGroups).forEach(([resource, endpoints]) => {
        files.push({
          path: `src/services/${resource}/index.${ext}`,
          content: generateMicroserviceSetup(resource, endpoints, config),
          language: config.language
        });

        endpoints.forEach(endpoint => {
          files.push({
            path: `src/services/${resource}/handlers/${endpoint.method.toLowerCase()}-${endpoint.name.toLowerCase()}.${ext}`,
            content: generateRouteHandler(endpoint, config),
            language: config.language
          });
        });
      });
      break;

    case 'serverless':
      files.push({
        path: 'serverless.yml',
        content: generateServerlessConfig(schema, config),
        language: 'yaml'
      });

      // Generate serverless functions
      schema.endpoints.forEach(endpoint => {
        files.push({
          path: `src/functions/${endpoint.method.toLowerCase()}-${endpoint.name.toLowerCase()}.${ext}`,
          content: generateServerlessFunction(endpoint, config),
          language: config.language
        });
      });
      break;
  }

  return files;
};

// Helper function to generate test files
const generateTestFiles = (schema: ParsedSchema, config: GeneratorConfig): GeneratedFile[] => {
  return schema.endpoints.map(endpoint => ({
    path: `src/tests/api/${getEndpointFileName(endpoint)}.test.ts`,
    content: generateEndpointTest(endpoint, config),
    language: 'typescript'
  }));
};

// Helper function to generate documentation files
const generateDocFiles = (schema: ParsedSchema, config: GeneratorConfig): GeneratedFile[] => {
  return [
    {
      path: 'docs/api.md',
      content: generateApiDocs(schema),
      language: 'markdown'
    },
    {
      path: 'docs/architecture.md',
      content: generateArchitectureDocs(config),
      language: 'markdown'
    }
  ];
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

// Helper function to parse schema
const parseSchema = (schema: string, format: string): ParsedSchema => {
  try {
    if (format === 'yaml') {
      return yaml.load(schema) as ParsedSchema;
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

// Helper function to parse DSL
const parseDSL = (schema: string): ParsedSchema => {
  const lines = schema.split('\n');
  const endpoints: ParsedEndpoint[] = [];
  let currentEndpoint: Partial<ParsedEndpoint> | null = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;

    if (trimmedLine.startsWith('endpoint')) {
      if (currentEndpoint) endpoints.push(currentEndpoint as ParsedEndpoint);
      currentEndpoint = { properties: {} };
      const match = trimmedLine.match(/endpoint\s+(\w+)\s*{/);
      if (match) currentEndpoint.name = match[1];
    } else if (trimmedLine.startsWith('}') && currentEndpoint) {
      endpoints.push(currentEndpoint as ParsedEndpoint);
      currentEndpoint = null;
    } else if (currentEndpoint && trimmedLine.includes(':')) {
      const [key, value] = trimmedLine.split(':').map(s => s.trim());
      if (key === 'properties' || key === 'request' || key === 'response') {
        try {
          currentEndpoint[key] = JSON.parse(value);
        } catch (e) {
          currentEndpoint[key] = {};
        }
      } else {
        currentEndpoint[key as keyof ParsedEndpoint] = value;
      }
    }
  });

  if (currentEndpoint) endpoints.push(currentEndpoint as ParsedEndpoint);

  return {
    name: 'API',
    endpoints
  };
};

// Generate monolith server
const generateMonolithServer = (config: GeneratorConfig): string => {
  return `import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';

const app = express();

app.use(cors());
app.use(json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
};

// Generate gateway
const generateGateway = (config: GeneratorConfig): string => {
  return `import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Add service proxies here
app.use('/api', createProxyMiddleware({ 
  target: 'http://localhost:4000',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(\`Gateway running on port \${PORT}\`);
});`;
};

// Generate serverless config
const generateServerlessConfig = (schema: ParsedSchema, config: GeneratorConfig): string => {
  return `service: ${schema.name.toLowerCase()}
provider:
  name: aws
  runtime: nodejs18.x
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-1'}

functions:
${schema.endpoints.map(endpoint => `  ${endpoint.name.toLowerCase()}:
    handler: src/functions/${endpoint.name.toLowerCase()}.handler
    events:
      - http:
          path: ${endpoint.path}
          method: ${endpoint.method.toLowerCase()}`).join('\n')}`;
};

// Generate endpoint test
const generateEndpointTest = (endpoint: ParsedEndpoint, config: GeneratorConfig): string => {
  return `import { describe, it, expect } from 'vitest';
import { ${endpoint.method.toLowerCase()}${endpoint.name} } from '../../lib/api/endpoints/${getEndpointFileName(endpoint)}';

describe('${endpoint.name} API', () => {
  it('should ${endpoint.method.toLowerCase()} ${endpoint.name.toLowerCase()}', async () => {
    // Add your test here
  });
});`;
};

// Generate API docs
const generateApiDocs = (schema: ParsedSchema): string => {
  return `# API Documentation

## Endpoints

${schema.endpoints.map(endpoint => `### ${endpoint.name}
- Method: ${endpoint.method}
- Path: ${endpoint.path}
- Authentication: ${endpoint.auth || 'None'}

#### Request
\`\`\`typescript
${JSON.stringify(endpoint.request || {}, null, 2)}
\`\`\`

#### Response
\`\`\`typescript
${JSON.stringify(endpoint.response || {}, null, 2)}
\`\`\`
`).join('\n')}`;
};

// Generate architecture docs
const generateArchitectureDocs = (config: GeneratorConfig): string => {
  return `# Architecture Documentation

## Overview
This project uses a ${config.architecture} architecture with ${config.apiStyle} API style.

## Technology Stack
- Frontend: ${config.frontendFramework}
- Backend: ${config.backendFramework}
- Database: ${config.database}
- State Management: ${config.stateManagement}
- API Client: ${config.httpClient}

## Authentication
${config.authType !== 'none' ? `Authentication is handled using ${config.authType}` : 'No authentication required'}`;
};

// Generate Dockerfile
const generateDockerfile = (config: GeneratorConfig): string => {
  return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`;
};

// Generate Docker Compose
const generateDockerCompose = (config: GeneratorConfig): string => {
  return `version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
${config.database !== 'none' ? `  db:
    image: ${config.database}
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=db` : ''}`;
};

// Generate route handler
const generateRouteHandler = (endpoint: ParsedEndpoint, config: GeneratorConfig): string => {
  const language = config.language;
  const isTypescript = language === 'typescript';
  const ext = isTypescript ? 'ts' : 'js';
  
  if (config.backendFramework === 'express') {
    return `${isTypescript ? 'import { Request, Response } from \'express\';' : ''}

export const ${endpoint.method.toLowerCase()}${endpoint.name}Handler = async (${isTypescript ? 'req: Request, res: Response' : 'req, res'}) => {
  try {
    ${generateHandlerLogic(endpoint, config)}
  } catch (error) {
    res.status(500).json({ error: ${isTypescript ? '(error as Error).message' : 'error.message'} });
  }
};`;
  }
  
  if (config.backendFramework === 'fastify') {
    return `${isTypescript ? 'import { FastifyRequest, FastifyReply } from \'fastify\';' : ''}

export const ${endpoint.method.toLowerCase()}${endpoint.name}Handler = async (${isTypescript ? 'req: FastifyRequest, reply: FastifyReply' : 'req, reply'}) => {
  try {
    ${generateHandlerLogic(endpoint, config)}
  } catch (error) {
    reply.status(500).send({ error: ${isTypescript ? '(error as Error).message' : 'error.message'} });
  }
};`;
  }

  if (config.backendFramework === 'nestjs') {
    return `import { Controller, ${endpoint.method}, Param${endpoint.method !== 'GET' ? ', Body' : ''} } from '@nestjs/common';
${endpoint.auth ? "import { UseGuards } from '@nestjs/common';\nimport { AuthGuard } from '@nestjs/passport';" : ''}

@Controller('${endpoint.path}')
${endpoint.auth ? '@UseGuards(AuthGuard())' : ''}
export class ${endpoint.name}Controller {
  @${endpoint.method}()
  async ${endpoint.method.toLowerCase()}${endpoint.name}(
    ${endpoint.method !== 'GET' ? `@Body() data: ${endpoint.name}Dto,` : ''}
    ${isTypescript ? ': Promise<any>' : ''} 
  ) {
    try {
      ${generateHandlerLogic(endpoint, config)}
    } catch (error) {
      throw new Error(${isTypescript ? '(error as Error).message' : 'error.message'});
    }
  }
}`;
  }

  return '';
};

// Generate handler logic based on endpoint
const generateHandlerLogic = (endpoint: ParsedEndpoint, config: GeneratorConfig): string => {
  if (endpoint.method === 'GET') {
    return `const data = await db.${endpoint.name.toLowerCase()}.findMany();
    ${config.backendFramework === 'nestjs' ? 'return data;' : 'res.json(data);'}`;
  }
  
  if (endpoint.method === 'POST') {
    return `const data = await db.${endpoint.name.toLowerCase()}.create({
      data: ${config.backendFramework === 'nestjs' ? 'data' : 'req.body'},
    });
    ${config.backendFramework === 'nestjs' ? 'return data;' : 'res.status(201).json(data);'}`;
  }
  
  if (endpoint.method === 'PUT') {
    return `const data = await db.${endpoint.name.toLowerCase()}.update({
      where: { id: ${config.backendFramework === 'nestjs' ? 'params.id' : 'req.params.id'} },
      data: ${config.backendFramework === 'nestjs' ? 'data' : 'req.body'},
    });
    ${config.backendFramework === 'nestjs' ? 'return data;' : 'res.json(data);'}`;
  }
  
  if (endpoint.method === 'DELETE') {
    return `await db.${endpoint.name.toLowerCase()}.delete({
      where: { id: ${config.backendFramework === 'nestjs' ? 'params.id' : 'req.params.id'} },
    });
    ${config.backendFramework === 'nestjs' ? 'return { success: true };' : 'res.status(204).send();'}`;
  }

  return '';
};

// Generate database schema
const generateDatabaseSchema = (schema: ParsedSchema, config: GeneratorConfig): string => {
  if (config.database === 'postgresql' || config.database === 'mysql') {
    return `-- Database Schema
${schema.endpoints.map(endpoint => `
CREATE TABLE ${endpoint.name.toLowerCase()} (
  id SERIAL PRIMARY KEY,
  ${Object.entries(endpoint.properties).map(([key, value]) => 
    `${key} ${getSqlType(value as any)}`
  ).join(',\n  ')},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`).join('\n')}`;
  }

  if (config.database === 'mongodb') {
    return `// MongoDB Schema
${schema.endpoints.map(endpoint => `
const ${endpoint.name}Schema = new Schema({
  ${Object.entries(endpoint.properties).map(([key, value]) => 
    `${key}: { type: ${getMongoType(value as any)} }`
  ).join(',\n  ')},
}, { timestamps: true });`).join('\n')}`;
  }

  return '';
};

// Helper function to get SQL type
const getSqlType = (type: any): string => {
  switch (type.type) {
    case 'string': return 'VARCHAR(255)';
    case 'number': return 'INTEGER';
    case 'boolean': return 'BOOLEAN';
    case 'date': return 'TIMESTAMP';
    default: return 'TEXT';
  }
};

// Helper function to get MongoDB type
const getMongoType = (type: any): string => {
  switch (type.type) {
    case 'string': return 'String';
    case 'number': return 'Number';
    case 'boolean': return 'Boolean';
    case 'date': return 'Date';
    default: return 'Mixed';
  }
};

// Generate microservice setup
const generateMicroserviceSetup = (resource: string, endpoints: ParsedEndpoint[], config: GeneratorConfig): string => {
  return `import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
${endpoints.map(endpoint => 
  `import { ${endpoint.method.toLowerCase()}${endpoint.name}Handler } from './handlers/${endpoint.method.toLowerCase()}-${endpoint.name.toLowerCase()}';`
).join('\n')}

const app = express();

app.use(cors());
app.use(json());

${endpoints.map(endpoint =>
  `app.${endpoint.method.toLowerCase()}('${endpoint.path}', ${endpoint.method.toLowerCase()}${endpoint.name}Handler);`
).join('\n')}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(\`${resource} service running on port \${PORT}\`);
});`;
};

// Generate serverless function
const generateServerlessFunction = (endpoint: ParsedEndpoint, config: GeneratorConfig): string => {
  return `import { APIGatewayProxyHandler } from 'aws-lambda';
${endpoint.auth ? "import { verifyToken } from '../utils/auth';" : ''}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    ${endpoint.auth ? `
    const token = event.headers.Authorization?.split(' ')[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    const user = await verifyToken(token);
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }
    ` : ''}

    ${generateHandlerLogic(endpoint, { ...config, backendFramework: 'lambda' })}

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error instanceof Error ? error.message : 'Internal server error' })
    };
  }
};`;
};
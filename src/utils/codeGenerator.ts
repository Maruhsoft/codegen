import * as yaml from 'js-yaml';
import { GeneratedFile, GeneratedProject, GeneratorConfig, InputFormat, ProjectStructure } from '../types';

const generateProjectStructure = (config: GeneratorConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [
    // Root level files
    {
      path: 'README.md',
      content: generateReadme(config),
      language: 'markdown'
    },
    {
      path: '.gitignore',
      content: generateGitignore(),
      language: 'gitignore'
    },
    {
      path: 'package.json',
      content: generateRootPackageJson(config),
      language: 'json'
    },
    {
      path: 'docker-compose.yml',
      content: generateDockerCompose(config),
      language: 'yaml'
    },

    // Client files
    {
      path: 'client/package.json',
      content: generateClientPackageJson(config),
      language: 'json'
    },
    {
      path: 'client/.env',
      content: generateClientEnv(config),
      language: 'env'
    },
    {
      path: 'client/src/App.tsx',
      content: generateClientApp(config),
      language: 'typescript'
    },
    {
      path: 'client/src/main.tsx',
      content: generateClientMain(config),
      language: 'typescript'
    },
    {
      path: 'client/src/vite-env.d.ts',
      content: '/// <reference types="vite/client" />',
      language: 'typescript'
    },
    {
      path: 'client/index.html',
      content: generateClientHtml(),
      language: 'html'
    },
    {
      path: 'client/vite.config.ts',
      content: generateViteConfig(config),
      language: 'typescript'
    },
    {
      path: 'client/tsconfig.json',
      content: generateClientTsConfig(),
      language: 'json'
    },

    // Server files
    {
      path: 'server/package.json',
      content: generateServerPackageJson(config),
      language: 'json'
    },
    {
      path: 'server/.env',
      content: generateServerEnv(config),
      language: 'env'
    },
    {
      path: 'server/server.ts',
      content: generateServerMain(config),
      language: 'typescript'
    },
    {
      path: 'server/tsconfig.json',
      content: generateServerTsConfig(),
      language: 'json'
    },

    // Shared files
    {
      path: 'shared/types/index.ts',
      content: generateSharedTypes(),
      language: 'typescript'
    },
    {
      path: 'shared/constants/index.ts',
      content: generateSharedConstants(),
      language: 'typescript'
    }
  ];

  return files;
};

const generateHttpClient = (config: GeneratorConfig): string => {
  switch (config.httpClient) {
    case 'axios':
      return `
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;`;

    case 'fetch':
      return `
const api = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = this.baseURL + endpoint;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  },

  get: (endpoint: string) => api.request(endpoint),
  post: (endpoint: string, data: any) => api.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint: string, data: any) => api.request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => api.request(endpoint, { method: 'DELETE' }),
};

export default api;`;

    case 'ky':
      return `
import ky from 'ky';

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;`;

    case 'superagent':
      return `
import superagent from 'superagent';

const api = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  get: (endpoint: string) => 
    superagent.get(\`\${api.baseURL}\${endpoint}\`),
  post: (endpoint: string, data: any) => 
    superagent.post(\`\${api.baseURL}\${endpoint}\`).send(data),
  put: (endpoint: string, data: any) => 
    superagent.put(\`\${api.baseURL}\${endpoint}\`).send(data),
  delete: (endpoint: string) => 
    superagent.delete(\`\${api.baseURL}\${endpoint}\`),
};

export default api;`;
  }
};

const generateStateManagement = (config: GeneratorConfig, endpoints: any[]): string => {
  switch (config.stateManagement) {
    case 'redux':
      return `
import { createSlice, configureStore } from '@reduxjs/toolkit';

${endpoints.map(endpoint => `
const ${endpoint.name.toLowerCase()}Slice = createSlice({
  name: '${endpoint.name.toLowerCase()}',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setData: set${endpoint.name}Data, setLoading: set${endpoint.name}Loading, setError: set${endpoint.name}Error } = ${endpoint.name.toLowerCase()}Slice.actions;
`).join('\n')}

export const store = configureStore({
  reducer: {
    ${endpoints.map(endpoint => `${endpoint.name.toLowerCase()}: ${endpoint.name.toLowerCase()}Slice.reducer`).join(',\n    ')},
  },
});`;

    case 'mobx':
      return `
import { makeAutoObservable } from 'mobx';

${endpoints.map(endpoint => `
class ${endpoint.name}Store {
  data = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  setData(data) {
    this.data = data;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
  }
}

export const ${endpoint.name.toLowerCase()}Store = new ${endpoint.name}Store();
`).join('\n')}`;

    case 'zustand':
      return `
import create from 'zustand';

${endpoints.map(endpoint => `
interface ${endpoint.name}State {
  data: any[];
  loading: boolean;
  error: Error | null;
  setData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const use${endpoint.name}Store = create<${endpoint.name}State>((set) => ({
  data: [],
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
`).join('\n')}`;

    case 'jotai':
      return `
import { atom } from 'jotai';

${endpoints.map(endpoint => `
export const ${endpoint.name.toLowerCase()}DataAtom = atom([]);
export const ${endpoint.name.toLowerCase()}LoadingAtom = atom(false);
export const ${endpoint.name.toLowerCase()}ErrorAtom = atom(null);
`).join('\n')}`;

    case 'none':
      return '';
  }
};

const generateWrapper = (config: GeneratorConfig, endpoint: any): string => {
  const baseImports = `import api from '../http/${config.httpClient}';`;
  
  switch (config.wrapperType) {
    case 'react-query':
      return `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
${baseImports}

export const use${endpoint.name}s = () => {
  return useQuery(['${endpoint.name.toLowerCase()}s'], () =>
    api.get('/${endpoint.name.toLowerCase()}s')
  );
};

export const useCreate${endpoint.name} = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: ${endpoint.name}) => api.post('/${endpoint.name.toLowerCase()}s', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['${endpoint.name.toLowerCase()}s']);
      },
    }
  );
};`;

    case 'swr':
      return `
import useSWR from 'swr';
${baseImports}

export const use${endpoint.name}s = () => {
  return useSWR('/${endpoint.name.toLowerCase()}s', api.get);
};

export const useCreate${endpoint.name} = () => {
  const { mutate } = useSWR('/${endpoint.name.toLowerCase()}s');
  
  const create = async (data: ${endpoint.name}) => {
    const result = await api.post('/${endpoint.name.toLowerCase()}s', data);
    mutate();
    return result;
  };

  return { create };
};`;

    case 'apollo':
      return `
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_${endpoint.name.toUpperCase()}S = gql\`
  query Get${endpoint.name}s {
    ${endpoint.name.toLowerCase()}s {
      id
      ${Object.keys(endpoint.properties).join('\n      ')}
    }
  }
\`;

const CREATE_${endpoint.name.toUpperCase()} = gql\`
  mutation Create${endpoint.name}($input: Create${endpoint.name}Input!) {
    create${endpoint.name}(input: $input) {
      id
      ${Object.keys(endpoint.properties).join('\n      ')}
    }
  }
\`;

export const use${endpoint.name}s = () => {
  return useQuery(GET_${endpoint.name.toUpperCase()}S);
};

export const useCreate${endpoint.name} = () => {
  return useMutation(CREATE_${endpoint.name.toUpperCase()});
};`;

    case 'urql':
      return `
import { useQuery, useMutation } from 'urql';

const Get${endpoint.name}sQuery = \`
  query Get${endpoint.name}s {
    ${endpoint.name.toLowerCase()}s {
      id
      ${Object.keys(endpoint.properties).join('\n      ')}
    }
  }
\`;

const Create${endpoint.name}Mutation = \`
  mutation Create${endpoint.name}($input: Create${endpoint.name}Input!) {
    create${endpoint.name}(input: $input) {
      id
      ${Object.keys(endpoint.properties).join('\n      ')}
    }
  }
\`;

export const use${endpoint.name}s = () => {
  return useQuery({ query: Get${endpoint.name}sQuery });
};

export const useCreate${endpoint.name} = () => {
  return useMutation(Create${endpoint.name}Mutation);
};`;

    case 'custom':
      return `
${baseImports}

export const ${endpoint.name.toLowerCase()}Api = {
  getAll: () => api.get('/${endpoint.name.toLowerCase()}s'),
  getById: (id: string) => api.get(\`/${endpoint.name.toLowerCase()}s/\${id}\`),
  create: (data: ${endpoint.name}) => api.post('/${endpoint.name.toLowerCase()}s', data),
  update: (id: string, data: Partial<${endpoint.name}>) => api.put(\`/${endpoint.name.toLowerCase()}s/\${id}\`, data),
  delete: (id: string) => api.delete(\`/${endpoint.name.toLowerCase()}s/\${id}\`),
};`;
  }
};

export const generateProject = async (
  schema: string,
  format: InputFormat,
  config: GeneratorConfig
): Promise<GeneratedProject> => {
  // Parse schema
  const parsedSchema = format === 'yaml' ? yaml.load(schema) : JSON.parse(schema);
  
  // Generate base project structure
  const files = generateProjectStructure(config);
  
  // Generate HTTP client
  files.push({
    path: 'client/src/services/http.ts',
    content: generateHttpClient(config),
    language: 'typescript',
  });

  // Generate state management if selected
  if (config.stateManagement !== 'none') {
    files.push({
      path: 'client/src/store/index.ts',
      content: generateStateManagement(config, parsedSchema.endpoints),
      language: 'typescript',
    });
  }

  // Generate API wrappers for each endpoint
  parsedSchema.endpoints.forEach((endpoint: any) => {
    // Client-side API wrapper
    files.push({
      path: `client/src/services/${endpoint.name.toLowerCase()}.ts`,
      content: generateWrapper(config, endpoint),
      language: 'typescript',
    });

    // Server-side controller
    files.push({
      path: `server/controllers/${endpoint.name.toLowerCase()}.controller.ts`,
      content: generateController(endpoint),
      language: 'typescript',
    });

    // Server-side route
    files.push({
      path: `server/routes/${endpoint.name.toLowerCase()}.route.ts`,
      content: generateRoute(endpoint),
      language: 'typescript',
    });

    // Server-side model
    files.push({
      path: `server/models/${endpoint.name.toLowerCase()}.model.ts`,
      content: generateModel(endpoint, config),
      language: 'typescript',
    });

    // Server-side service
    files.push({
      path: `server/services/${endpoint.name.toLowerCase()}.service.ts`,
      content: generateService(endpoint),
      language: 'typescript',
    });
  });

  // Build project structure
  const structure = buildProjectStructure(files);

  return {
    files,
    structure,
  };
};

const generateController = (endpoint: any): string => {
  return `
import { Request, Response } from 'express';
import { ${endpoint.name}Service } from '../services/${endpoint.name.toLowerCase()}.service';

export class ${endpoint.name}Controller {
  constructor(private service: ${endpoint.name}Service) {}

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.service.findAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request' });
    }
  }
}`;
};

const generateRoute = (endpoint: any): string => {
  return `
import { Router } from 'express';
import { ${endpoint.name}Controller } from '../controllers/${endpoint.name.toLowerCase()}.controller';
import { ${endpoint.name}Service } from '../services/${endpoint.name.toLowerCase()}.service';

const router = Router();
const service = new ${endpoint.name}Service();
const controller = new ${endpoint.name}Controller(service);

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));

export default router;`;
};

const generateModel = (endpoint: any, config: GeneratorConfig): string => {
  switch (config.database) {
    case 'mongodb':
      return `
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  ${Object.entries(endpoint.properties).map(([key, value]: [string, any]) => 
    `${key}: { type: ${value.type}, required: ${!!value.required} }`
  ).join(',\n  ')}
}, { timestamps: true });

export const ${endpoint.name}Model = mongoose.model('${endpoint.name}', schema);`;

    case 'postgresql':
    case 'mysql':
      return `
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class ${endpoint.name} extends Model {}

${endpoint.name}.init({
  ${Object.entries(endpoint.properties).map(([key, value]: [string, any]) => 
    `${key}: { type: DataTypes.${value.type.toUpperCase()}, allowNull: ${!value.required} }`
  ).join(',\n  ')}
}, {
  sequelize,
  modelName: '${endpoint.name}',
  timestamps: true,
});`;

    default:
      return '';
  }
};

const generateService = (endpoint: any): string => {
  return `
import { ${endpoint.name}Model } from '../models/${endpoint.name.toLowerCase()}.model';

export class ${endpoint.name}Service {
  async findAll() {
    return ${endpoint.name}Model.find();
  }

  async create(data: any) {
    return ${endpoint.name}Model.create(data);
  }
}`;
};

const generateReadme = (config: GeneratorConfig): string => {
  return `# Generated Project

## Stack
- Frontend: ${config.frontendFramework}
- Backend: ${config.backendFramework}
- Database: ${config.database}
- Authentication: ${config.authType}
- API Style: ${config.apiStyle}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure
- \`client/\`: Frontend application
- \`server/\`: Backend API
- \`shared/\`: Shared types and utilities`;
};

const generateGitignore = (): string => {
  return `
node_modules/
dist/
build/
.env
.env.local
.DS_Store
*.log`;
};

const generateRootPackageJson = (config: GeneratorConfig): string => {
  return JSON.stringify({
    name: "generated-project",
    version: "1.0.0",
    private: true,
    workspaces: [
      "client",
      "server",
      "shared"
    ],
    scripts: {
      "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
      "dev:client": "npm run dev -w client",
      "dev:server": "npm run dev -w server",
      "build": "npm run build -w client && npm run build -w server",
      "start": "npm run start -w server"
    },
    devDependencies: {
      "concurrently": "^8.2.2",
      "typescript": "^5.0.0"
    }
  }, null, 2);
};

const generateClientPackageJson = (config: GeneratorConfig): string => {
  const deps: Record<string, string> = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    [config.httpClient]: "^latest"
  };

  if (config.stateManagement !== 'none') {
    deps[config.stateManagement] = "^latest";
  }

  if (config.wrapperType !== 'custom') {
    deps[config.wrapperType] = "^latest";
  }

  return JSON.stringify({
    name: "client",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    dependencies: deps,
    devDependencies: {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.0.0",
      "typescript": "^5.0.0",
      "vite": "^5.0.0"
    }
  }, null, 2);
};

const generateServerPackageJson = (config: GeneratorConfig): string => {
  const deps: Record<string, string> = {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  };

  if (config.database === 'mongodb') {
    deps["mongoose"] = "^7.0.0";
  } else if (config.database === 'postgresql' || config.database === 'mysql') {
    deps["sequelize"] = "^6.0.0";
  }

  return JSON.stringify({
    name: "server",
    version: "1.0.0",
    private: true,
    scripts: {
      "dev": "ts-node-dev --respawn src/server.ts",
      "build": "tsc",
      "start": "node dist/server.js"
    },
    dependencies: deps,
    devDependencies: {
      "@types/express": "^4.17.17",
      "@types/cors": "^2.8.13",
      "ts-node-dev": "^2.0.0",
      "typescript": "^5.0.0"
    }
  }, null, 2);
};

const generateClientEnv = (config: GeneratorConfig): string => {
  return `VITE_API_URL=http://localhost:3000`;
};

const generateServerEnv = (config: GeneratorConfig): string => {
  return `
PORT=3000
NODE_ENV=development
${config.database === 'mongodb' ? 'MONGODB_URI=mongodb://localhost:27017/app' : ''}
${config.database === 'postgresql' ? 'DATABASE_URL=postgresql://user:password@localhost:5432/app' : ''}
${config.database === 'mysql' ? 'DATABASE_URL=mysql://user:password@localhost:3306/app' : ''}`;
};

const generateClientApp = (config: GeneratorConfig): string => {
  return `
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Generated App</h1>
    </div>
  );
}

export default App;`;
};

const generateClientMain = (config: GeneratorConfig): string => {
  return `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
};

const generateClientHtml = (): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
};

const generateViteConfig = (config: GeneratorConfig): string => {
  return `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;
};

const generateClientTsConfig = (): string => {
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

const generateServerTsConfig = (): string => {
  return JSON.stringify({
    compilerOptions: {
      target: "es2020",
      module: "commonjs",
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ["src"],
    exclude: ["node_modules"]
  }, null, 2);
};

const generateServerMain = (config: GeneratorConfig): string => {
  return `
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
};

const generateSharedTypes = (): string => {
  return `
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}`;
};

const generateSharedConstants = (): string => {
  return `
export const API_ENDPOINTS = {
  BASE_URL: process.env.API_URL || 'http://localhost:3000',
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
};`;
};

const generateDockerCompose = (config: GeneratorConfig): string => {
  return `
version: '3.8'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./client:/app
      - /app/node_modules

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - ${config.database}

  ${config.database}:
    image: ${config.database}:latest
    ports:
      - "27017:27017"
    volumes:
      - db-data:/data/db

volumes:
  db-data:`;
};

const buildProjectStructure = (files: GeneratedFile[]): ProjectStructure => {
  const root: ProjectStructure = {
    name: 'project',
    type: 'directory',
    path: '',
    children: [],
  };

  const dirMap = new Map<string, ProjectStructure>();
  dirMap.set('', root);

  files.forEach((file) => {
    const parts = file.path.split('/');
    const fileName = parts.pop() || '';
    let currentPath = '';

    parts.forEach((part) => {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!dirMap.has(currentPath)) {
        const newDir: ProjectStructure = {
          name: part,
          type: 'directory',
          path: currentPath,
          children: [],
        };
        dirMap.set(currentPath, newDir);

        const parent = dirMap.get(parentPath);
        if (parent?.children) {
          parent.children.push(newDir);
        }
      }
    });

    const fileStructure: ProjectStructure = {
      name: fileName,
      type: 'file',
      path: file.path,
      language: file.language,
    };

    const parent = dirMap.get(parts.join('/'));
    if (parent?.children) {
      parent.children.push(fileStructure);
    }
  });

  return root;
};
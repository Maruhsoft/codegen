import { GeneratedFile, GeneratedProject, GeneratorConfig, InputFormat, ProjectStructure } from '../types';

// This is a mock implementation - in a real app, this would use actual code generation logic
export const generateProject = async (
  schema: string,
  format: InputFormat,
  config: GeneratorConfig
): Promise<GeneratedProject> => {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In a real implementation, this would parse the schema and generate actual code
  const frontendFiles = generateFrontendFiles(config);
  const backendFiles = generateBackendFiles(config);
  const sharedFiles = generateSharedFiles(config);
  const rootFiles = generateRootFiles(config);

  const allFiles = [...frontendFiles, ...backendFiles, ...sharedFiles, ...rootFiles];
  
  const structure = buildProjectStructure(allFiles);

  return {
    files: allFiles,
    structure,
  };
};

const generateFrontendFiles = (config: GeneratorConfig): GeneratedFile[] => {
  // In a real app, this would generate actual frontend code based on config
  const files: GeneratedFile[] = [
    {
      path: 'frontend/package.json',
      content: JSON.stringify({
        name: 'frontend',
        version: '1.0.0',
        dependencies: {
          [config.frontendFramework === 'react' ? 'react' : config.frontendFramework]: '^18.0.0',
          axios: '^1.3.4',
        },
      }, null, 2),
      language: 'json',
    },
    {
      path: 'frontend/src/api/index.ts',
      content: `// Generated API client
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;
`,
      language: 'typescript',
    },
    {
      path: 'frontend/src/api/users.ts',
      content: `// Generated API client for User endpoints
import api from './index';
import { User, CreateUserDto } from '../../shared/types';

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const response = await api.post<User>('/users', userData);
  return response.data;
};
`,
      language: 'typescript',
    },
  ];

  if (config.frontendFramework === 'react' || config.frontendFramework === 'next') {
    files.push({
      path: 'frontend/src/components/UserList.tsx',
      content: `import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/users';
import { User } from '../../shared/types';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
`,
      language: 'typescript',
    });
  }

  return files;
};

const generateBackendFiles = (config: GeneratorConfig): GeneratedFile[] => {
  // In a real app, this would generate actual backend code based on config
  const files: GeneratedFile[] = [
    {
      path: 'backend/package.json',
      content: JSON.stringify({
        name: 'backend',
        version: '1.0.0',
        dependencies: {
          [config.backendFramework === 'express' ? 'express' : config.backendFramework]: '^4.18.2',
          [config.language === 'typescript' ? 'typescript' : '']: '^4.9.5',
        },
      }, null, 2),
      language: 'json',
    },
    {
      path: 'backend/src/controllers/user.controller.ts',
      content: `// Generated User Controller
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { validateUser } from '../utils/validators';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const user = new User(req.body);
    const savedUser = await user.save();
    return res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
`,
      language: 'typescript',
    },
    {
      path: 'backend/src/models/user.model.ts',
      content: `// Generated User Model
${config.backendFramework === 'nestjs' ? "import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';" : ''}
${config.backendFramework !== 'nestjs' ? "import mongoose from 'mongoose';" : ''}

${
  config.backendFramework === 'nestjs'
    ? `@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}`
    : `const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model('User', userSchema);`
}
`,
      language: 'typescript',
    },
    {
      path: 'backend/src/routes/user.routes.ts',
      content: `// Generated User Routes
import { Router } from 'express';
import { getUsers, createUser } from '../controllers/user.controller';
${config.authType !== 'none' ? "import { authMiddleware } from '../middlewares/auth';" : ''}

const router = Router();

router.get('/users', ${config.authType !== 'none' ? 'authMiddleware, ' : ''}getUsers);
router.post('/users', ${config.authType !== 'none' ? 'authMiddleware, ' : ''}createUser);

export default router;
`,
      language: 'typescript',
    },
  ];

  if (config.authType !== 'none') {
    files.push({
      path: 'backend/src/middlewares/auth.ts',
      content: `// Generated Auth Middleware
import { Request, Response, NextFunction } from 'express';
${config.authType === 'jwt' ? "import jwt from 'jsonwebtoken';" : ''}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

${
  config.authType === 'jwt'
    ? `    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;`
    : config.authType === 'apikey'
    ? `    const apiKey = authHeader.replace('ApiKey ', '');
    // In a real app, validate API key against database
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Invalid API key' });
    }`
    : `    // OAuth 2.0 token validation would go here
    // This is just a placeholder implementation`
}
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
`,
      language: 'typescript',
    });

    files.push({
      path: 'backend/src/controllers/auth.controller.ts',
      content: `// Generated Auth Controller
import { Request, Response } from 'express';
import { User } from '../models/user.model';
${config.authType === 'jwt' ? "import jwt from 'jsonwebtoken';" : ''}
import { comparePasswords, hashPassword } from '../utils/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
${
  config.authType === 'jwt'
    ? `    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ token });`
    : `    // Generate auth token based on selected auth type
    res.status(200).json({ message: 'Login successful' });`
}
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
${
  config.authType === 'jwt'
    ? `    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ token });`
    : `    res.status(201).json({ message: 'User registered successfully' });`
}
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
`,
      language: 'typescript',
    });
  }

  return files;
};

const generateSharedFiles = (config: GeneratorConfig): GeneratedFile[] => {
  return [
    {
      path: 'shared/types/index.ts',
      content: `// Generated TypeScript interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

// Add more shared types as needed
`,
      language: 'typescript',
    },
  ];
};

const generateRootFiles = (config: GeneratorConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [
    {
      path: 'README.md',
      content: `# Generated API Project

This project was generated using the API-First Code Generator.

## Structure

- \`/frontend\`: ${config.frontendFramework} application
- \`/backend\`: ${config.backendFramework} API
- \`/shared\`: Shared types and utilities

## Getting Started

1. Install dependencies:
   \`\`\`
   cd frontend && npm install
   cd backend && npm install
   \`\`\`

2. Start the development servers:
   \`\`\`
   cd frontend && npm run dev
   cd backend && npm run dev
   \`\`\`

## Features

- API endpoints for user management
${config.authType !== 'none' ? `- ${config.authType.toUpperCase()} authentication` : ''}
${config.generateTests ? '- Test suite for all components and endpoints' : ''}
${config.generateDocs ? '- API documentation with Swagger/OpenAPI' : ''}
`,
      language: 'markdown',
    },
  ];

  if (config.generateDocker) {
    files.push({
      path: 'docker-compose.yml',
      content: `version: '3'

services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - API_URL=http://backend:8000

  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
${
  config.backendFramework !== 'fastapi' && config.backendFramework !== 'go-fiber' && config.backendFramework !== 'go-gin'
    ? `      - DATABASE_URL=mongodb://db:27017/app
      - JWT_SECRET=your-secret-key

  db:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db`
    : ''
}

volumes:
${
  config.backendFramework !== 'fastapi' && config.backendFramework !== 'go-fiber' && config.backendFramework !== 'go-gin'
    ? '  mongodb_data:'
    : ''
}
`,
      language: 'yaml',
    });
  }

  return files;
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

  // First pass: create all directories
  for (const file of files) {
    const parts = file.path.split('/');
    const fileName = parts.pop() || '';
    let currentPath = '';

    // Create directory path
    for (const part of parts) {
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

        // Add to parent
        const parent = dirMap.get(parentPath);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(newDir);
        }
      }
    }

    // Create file
    const filePath = file.path;
    const fileStructure: ProjectStructure = {
      name: fileName,
      type: 'file',
      path: filePath,
      language: file.language,
    };

    // Add to parent directory
    const parentPath = parts.join('/');
    const parent = dirMap.get(parentPath);
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(fileStructure);
    }
  }

  return root;
};
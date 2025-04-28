import { GeneratedFile, GeneratedProject, GeneratorConfig, InputFormat, ProjectStructure, WrapperType } from '../types';

// Generate wrapper code based on selected type
const generateWrapper = (config: GeneratorConfig, endpoint: any): string => {
  switch (config.wrapperType) {
    case 'class':
      return `
class ${endpoint.name}Api {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({ baseURL });
  }

  async get${endpoint.name}s(): Promise<${endpoint.name}[]> {
    const response = await this.api.get<${endpoint.name}[]>('/${endpoint.path}');
    return response.data;
  }

  async create${endpoint.name}(data: Create${endpoint.name}Dto): Promise<${endpoint.name}> {
    const response = await this.api.post<${endpoint.name}>('/${endpoint.path}', data);
    return response.data;
  }
}`;

    case 'functional':
      return `
export const get${endpoint.name}s = async (): Promise<${endpoint.name}[]> => {
  const response = await api.get<${endpoint.name}[]>('/${endpoint.path}');
  return response.data;
};

export const create${endpoint.name} = async (data: Create${endpoint.name}Dto): Promise<${endpoint.name}> => {
  const response = await api.post<${endpoint.name}>('/${endpoint.path}', data);
  return response.data;
};`;

    case 'hooks':
      return `
export const use${endpoint.name}s = () => {
  const [data, setData] = useState<${endpoint.name}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<${endpoint.name}[]>('/${endpoint.path}');
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useCreate${endpoint.name} = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: Create${endpoint.name}Dto) => {
    setLoading(true);
    try {
      const response = await api.post<${endpoint.name}>('/${endpoint.path}', data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};`;

    case 'hoc':
      return `
export const with${endpoint.name}s = (WrappedComponent: React.ComponentType<any>) => {
  return function With${endpoint.name}s(props: any) {
    const [data, setData] = useState<${endpoint.name}[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await api.get<${endpoint.name}[]>('/${endpoint.path}');
          setData(response.data);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    return <WrappedComponent {...props} data={data} loading={loading} error={error} />;
  };
};`;

    default:
      return '';
  }
};

// Generate API client based on selected style
const generateApiClient = (config: GeneratorConfig, endpoint: any): string => {
  switch (config.apiStyle) {
    case 'rest':
      return `
import axios from 'axios';
import { ${endpoint.name}, Create${endpoint.name}Dto } from '../types';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

${generateWrapper(config, endpoint)}`;

    case 'graphql':
      return `
import { gql } from '@apollo/client';

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

${generateWrapper(config, endpoint)}`;

    case 'grpc':
      return `
import { credentials } from '@grpc/grpc-js';
import { ${endpoint.name}Client } from '../proto/${endpoint.name.toLowerCase()}_grpc_pb';
import { Get${endpoint.name}sRequest, Create${endpoint.name}Request } from '../proto/${endpoint.name.toLowerCase()}_pb';

const client = new ${endpoint.name}Client(
  'localhost:50051',
  credentials.createInsecure()
);

${generateWrapper(config, endpoint)}`;

    case 'websocket':
      return `
import { io } from 'socket.io-client';

const socket = io(process.env.WS_URL || 'ws://localhost:3000', {
  autoConnect: false,
  reconnection: true,
});

${generateWrapper(config, endpoint)}`;

    default:
      return '';
  }
};

export const generateProject = async (
  schema: string,
  format: InputFormat,
  config: GeneratorConfig
): Promise<GeneratedProject> => {
  // Parse schema
  const parsedSchema = format === 'yaml' ? yaml.load(schema) : JSON.parse(schema);
  
  // Generate files based on schema and config
  const files: GeneratedFile[] = [];
  
  // Generate API client files for each endpoint
  parsedSchema.endpoints.forEach((endpoint: any) => {
    const fileName = endpoint.name.toLowerCase();
    files.push({
      path: `frontend/src/api/${fileName}.ts`,
      content: generateApiClient(config, endpoint),
      language: 'typescript',
    });
  });

  // Generate types
  files.push({
    path: 'shared/types/index.ts',
    content: generateTypes(parsedSchema),
    language: 'typescript',
  });

  // Build project structure
  const structure = buildProjectStructure(files);

  return {
    files,
    structure,
  };
};

// Helper function to generate TypeScript types from schema
const generateTypes = (schema: any): string => {
  let content = '// Generated TypeScript interfaces\n\n';
  
  schema.endpoints.forEach((endpoint: any) => {
    content += `export interface ${endpoint.name} {\n`;
    Object.entries(endpoint.properties).forEach(([key, value]: [string, any]) => {
      content += `  ${key}: ${value.type};\n`;
    });
    content += '}\n\n';

    content += `export interface Create${endpoint.name}Dto {\n`;
    Object.entries(endpoint.properties)
      .filter(([_, value]: [string, any]) => value.required)
      .forEach(([key, value]: [string, any]) => {
        content += `  ${key}: ${value.type};\n`;
      });
    content += '}\n\n';
  });

  return content;
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
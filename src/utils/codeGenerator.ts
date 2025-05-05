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
    // Generate endpoint file
    files.push({
      path: `src/lib/api/endpoints/${getEndpointFileName(endpoint)}.ts`,
      content: generateApiEndpoint(endpoint, config),
      language: 'typescript'
    });

    // Generate types
    files.push({
      path: `src/types/api/${getEndpointFileName(endpoint)}.ts`,
      content: generateEndpointTypes(endpoint),
      language: 'typescript'
    });

    // Generate hooks based on wrapper type
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

  // Generate common types
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

  switch (config.architecture) {
    case 'monolith':
      files.push({
        path: 'src/server/index.ts',
        content: generateMonolithServer(config),
        language: 'typescript'
      });

      schema.endpoints.forEach(endpoint => {
        files.push({
          path: `src/server/routes/${getEndpointFileName(endpoint)}.ts`,
          content: generateMonolithRoute(endpoint, config),
          language: 'typescript'
        });
      });
      break;

    case 'microservices':
      files.push({
        path: 'src/gateway/index.ts',
        content: generateGateway(config),
        language: 'typescript'
      });

      // Group endpoints by resource
      const resourceGroups = schema.endpoints.reduce((groups, endpoint) => {
        const resource = endpoint.path.split('/')[1];
        if (!groups[resource]) groups[resource] = [];
        groups[resource].push(endpoint);
        return groups;
      }, {} as Record<string, ParsedEndpoint[]>);

      Object.entries(resourceGroups).forEach(([resource, endpoints]) => {
        files.push({
          path: `src/services/${resource}/index.ts`,
          content: generateMicroserviceSetup(resource, endpoints, config),
          language: 'typescript'
        });

        endpoints.forEach(endpoint => {
          files.push({
            path: `src/services/${resource}/handlers/${getEndpointFileName(endpoint)}.ts`,
            content: generateMicroserviceHandler(endpoint, config),
            language: 'typescript'
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

      schema.endpoints.forEach(endpoint => {
        files.push({
          path: `src/functions/${getEndpointFileName(endpoint)}.ts`,
          content: generateServerlessFunction(endpoint, config),
          language: 'typescript'
        });
      });
      break;
  }

  return files;
};

// Helper function to generate test files
const generateTestFiles = (schema: ParsedSchema, config: GeneratorConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [
    {
      path: 'src/setupTests.ts',
      content: generateTestSetup(config),
      language: 'typescript'
    }
  ];

  schema.endpoints.forEach(endpoint => {
    files.push({
      path: `src/tests/api/${getEndpointFileName(endpoint)}.test.ts`,
      content: generateEndpointTest(endpoint, config),
      language: 'typescript'
    });
  });

  return files;
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
    },
    {
      path: '.dockerignore',
      content: generateDockerignore(),
      language: 'text'
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
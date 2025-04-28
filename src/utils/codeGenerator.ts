// Previous code remains the same until generateMicroservicesStructure

const generateMicroservicesStructure = (config: GeneratorConfig, schema: any): GeneratedFile[] => {
  const files: GeneratedFile[] = [
    // Root configuration
    {
      path: 'package.json',
      content: generateRootPackageJson(config),
      language: 'json'
    },
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
      path: 'docker-compose.yml',
      content: generateDockerCompose(config),
      language: 'yaml'
    },
    // API Gateway
    {
      path: 'gateway/package.json',
      content: generateGatewayPackageJson(config),
      language: 'json'
    },
    {
      path: 'gateway/src/server.ts',
      content: generateGatewayServer(config),
      language: 'typescript'
    }
  ];

  // Group endpoints by resource
  const resourceGroups = schema.endpoints.reduce((acc: any, endpoint: any) => {
    const resource = endpoint.name.toLowerCase();
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(endpoint);
    return acc;
  }, {});

  // Generate a microservice for each resource
  Object.entries(resourceGroups).forEach(([resource, endpoints]: [string, any]) => {
    files.push(
      // Service configuration
      {
        path: `services/${resource}/package.json`,
        content: generateServicePackageJson(resource, config),
        language: 'json'
      },
      {
        path: `services/${resource}/Dockerfile`,
        content: generateServiceDockerfile(resource),
        language: 'dockerfile'
      },
      {
        path: `services/${resource}/src/server.ts`,
        content: generateServiceServer(resource, endpoints, config),
        language: 'typescript'
      },
      // Service implementation
      ...endpoints.map((endpoint: any) => ({
        path: `services/${resource}/src/controllers/${getEndpointName(endpoint)}.controller.ts`,
        content: generateController(endpoint),
        language: 'typescript'
      })),
      ...endpoints.map((endpoint: any) => ({
        path: `services/${resource}/src/services/${getEndpointName(endpoint)}.service.ts`,
        content: generateService(endpoint),
        language: 'typescript'
      }))
    );

    if (config.generateTests) {
      files.push(
        ...endpoints.map((endpoint: any) => ({
          path: `services/${resource}/src/tests/${getEndpointName(endpoint)}.test.ts`,
          content: generateServerTests(endpoint),
          language: 'typescript'
        }))
      );
    }
  });

  return files;
};

const generateServerlessStructure = (config: GeneratorConfig, schema: any): GeneratedFile[] => {
  const files: GeneratedFile[] = [
    // Root configuration
    {
      path: 'package.json',
      content: generateRootPackageJson(config),
      language: 'json'
    },
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
    // Serverless configuration
    {
      path: 'serverless.yml',
      content: generateServerlessConfig(config),
      language: 'yaml'
    }
  ];

  // Generate a function for each endpoint
  schema.endpoints.forEach((endpoint: any) => {
    const functionName = getEndpointName(endpoint);
    
    files.push(
      // Function implementation
      {
        path: `functions/${functionName}/index.ts`,
        content: generateServerlessFunction(endpoint, config),
        language: 'typescript'
      },
      {
        path: `functions/${functionName}/schema.ts`,
        content: generateServerlessSchema(endpoint),
        language: 'typescript'
      }
    );

    if (config.generateTests) {
      files.push({
        path: `functions/${functionName}/index.test.ts`,
        content: generateServerlessTests(endpoint),
        language: 'typescript'
      });
    }
  });

  return files;
};

const generateServerlessFunction = (endpoint: any, config: GeneratorConfig): string => {
  const className = getClassName(endpoint);
  const method = endpoint.method.toLowerCase();

  return `
import { APIGatewayProxyHandler } from 'aws-lambda';
import { ${endpoint.name}Schema } from './schema';
import { prisma } from '../../lib/prisma';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    ${method === 'get' 
      ? `const items = await prisma.${endpoint.name.toLowerCase()}.findMany();
         return {
           statusCode: 200,
           body: JSON.stringify(items)
         };`
      : `const data = JSON.parse(event.body || '{}');
         const validatedData = ${endpoint.name}Schema.parse(data);
         const result = await prisma.${endpoint.name.toLowerCase()}.create({
           data: validatedData
         });
         return {
           statusCode: 201,
           body: JSON.stringify(result)
         };`
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};`;
};

const generateServerlessSchema = (endpoint: any): string => {
  return `
import { z } from 'zod';

export const ${endpoint.name}Schema = z.object({
  ${Object.entries(endpoint.properties || {}).map(([key, value]: [string, any]) => 
    `${key}: z.${value.type}()${value.required ? '' : '.optional()'}${
      value.format === 'email' ? '.email()' : 
      value.format === 'uuid' ? '.uuid()' : 
      ''
    }`
  ).join(',\n  ')}
});`;
};

const generateServerlessTests = (endpoint: any): string => {
  return `
import { handler } from './index';

describe('${endpoint.name} Lambda Function', () => {
  it('should handle the request successfully', async () => {
    const event = {
      // Add test event data
    };
    
    const result = await handler(event as any, {} as any, () => {});
    expect(result.statusCode).toBe(${endpoint.method.toLowerCase() === 'post' ? 201 : 200});
  });
});`;
};

const generateServerlessConfig = (config: GeneratorConfig): string => {
  return `
service: ${config.name || 'api'}

provider:
  name: aws
  runtime: nodejs18.x
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-1'}

functions:
  # Functions will be added here based on the API schema
`;
};

// Rest of the file remains unchanged
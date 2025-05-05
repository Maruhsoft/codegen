import * as yaml from 'js-yaml';
import { InputFormat } from '../types';

export const validateSchema = (
  schema: string,
  format: InputFormat
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!schema.trim()) {
    return { isValid: false, errors: ['Schema cannot be empty'] };
  }

  try {
    let parsedSchema;
    
    if (format === 'json' || format === 'openapi') {
      parsedSchema = JSON.parse(schema);
      validateJsonSchema(parsedSchema, errors);
    } else if (format === 'yaml') {
      parsedSchema = yaml.load(schema);
      validateYamlSchema(parsedSchema, errors);
    } else if (format === 'dsl') {
      validateDslSchema(schema, errors);
    }

    // Common validations for all formats
    if (parsedSchema && !parsedSchema.endpoints?.length && format !== 'dsl') {
      errors.push('Schema must contain at least one endpoint definition');
    }

    // Validate endpoint properties
    if (parsedSchema?.endpoints) {
      parsedSchema.endpoints.forEach((endpoint: any, index: number) => {
        if (!endpoint.name) {
          errors.push(`Endpoint #${index + 1}: Name is required`);
        }
        if (!endpoint.properties) {
          errors.push(`Endpoint #${index + 1}: Properties are required`);
        }
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      errors.push(`Invalid ${format.toUpperCase()} format: ${e.message}`);
    } else {
      errors.push(`Invalid ${format.toUpperCase()} format`);
    }
    return { isValid: false, errors };
  }

  return { isValid: errors.length === 0, errors };
};

const validateJsonSchema = (schema: any, errors: string[]) => {
  if (!schema.name) {
    errors.push('API name is required');
  }

  if (schema.endpoints) {
    schema.endpoints.forEach((endpoint: any, index: number) => {
      if (!endpoint.path) {
        errors.push(`Endpoint #${index + 1}: Path is required`);
      }
      if (!endpoint.method) {
        errors.push(`Endpoint #${index + 1}: HTTP method is required`);
      }
      if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(endpoint.method?.toUpperCase())) {
        errors.push(`Endpoint #${index + 1}: Invalid HTTP method "${endpoint.method}"`);
      }
    });
  }
};

const validateYamlSchema = (schema: any, errors: string[]) => {
  // Similar to JSON validation
  validateJsonSchema(schema, errors);
};

const validateDslSchema = (schema: string, errors: string[]) => {
  const lines = schema.split('\n');
  let hasEndpoint = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('endpoint') || line.startsWith('api') || line.startsWith('route')) {
      hasEndpoint = true;
      // Validate endpoint syntax
      if (!line.includes('{')) {
        errors.push(`Line ${i + 1}: Invalid endpoint definition syntax`);
      }
    }
  }

  if (!hasEndpoint) {
    errors.push('DSL must contain at least one endpoint definition');
  }
};
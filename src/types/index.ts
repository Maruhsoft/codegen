// Common types used throughout the application
export type Framework = 'react' | 'next' | 'vue' | 'nuxt' | 'svelte' | 'vanilla';
export type BackendFramework = 'express' | 'nestjs' | 'fastify' | 'go-fiber' | 'go-gin' | 'fastapi' | 'actix';
export type Architecture = 'monolith' | 'microservices' | 'serverless';
export type AuthType = 'none' | 'jwt' | 'oauth2' | 'apikey';
export type InputFormat = 'dsl' | 'json' | 'yaml' | 'openapi';

export interface GeneratorConfig {
  frontendFramework: Framework;
  backendFramework: BackendFramework;
  architecture: Architecture;
  authType: AuthType;
  generateTests: boolean;
  generateDocs: boolean;
  generateDocker: boolean;
  language: 'typescript' | 'javascript';
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string; // For syntax highlighting
}

export interface GeneratedProject {
  files: GeneratedFile[];
  structure: ProjectStructure;
}

export interface ProjectStructure {
  name: string;
  type: 'directory' | 'file';
  path: string;
  children?: ProjectStructure[];
  language?: string; // Only for files
}
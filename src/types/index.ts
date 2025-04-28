export type Framework = 'react' | 'next' | 'vue' | 'nuxt' | 'svelte' | 'vanilla';
export type BackendFramework = 'express' | 'nestjs' | 'fastify' | 'fastapi' | 'go-fiber' | 'go-gin';
export type Architecture = 'monolith' | 'microservices' | 'serverless';
export type AuthType = 'none' | 'jwt' | 'oauth2' | 'apikey';
export type InputFormat = 'dsl' | 'json' | 'yaml' | 'openapi';
export type ApiStyle = 'rest' | 'graphql' | 'grpc' | 'websocket';
export type HttpClient = 'axios' | 'fetch' | 'ky' | 'superagent';
export type StateManagement = 'redux' | 'mobx' | 'zustand' | 'jotai' | 'none';
export type WrapperType = 'react-query' | 'swr' | 'apollo' | 'urql' | 'custom';
export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql' | 'sqlite' | 'none';
export type CacheStrategy = 'none' | 'redis' | 'memory' | 'filesystem';

export interface GeneratorConfig {
  frontendFramework: Framework;
  backendFramework: BackendFramework;
  architecture: Architecture;
  authType: AuthType;
  apiStyle: ApiStyle;
  httpClient: HttpClient;
  stateManagement: StateManagement;
  wrapperType: WrapperType;
  database: DatabaseType;
  caching: CacheStrategy;
  generateTests: boolean;
  generateDocs: boolean;
  generateDocker: boolean;
  language: 'typescript' | 'javascript';
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
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
  language?: string;
}
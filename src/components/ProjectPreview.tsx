import React, { useState } from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { ProjectStructure } from '../types';
import { ChevronRight, ChevronDown, File, Folder, Server, Cloud, Package } from 'lucide-react';

const ProjectPreview: React.FC = () => {
  const { generatedProject, config } = useGenerator();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const getArchitectureIcon = () => {
    switch (config.architecture) {
      case 'microservices':
        return <Server className="h-5 w-5 text-blue-500" />;
      case 'serverless':
        return <Cloud className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-green-500" />;
    }
  };

  const renderStructure = (item: ProjectStructure, level = 0) => {
    const isExpanded = expandedPaths.has(item.path);
    const paddingLeft = `${level * 16}px`;

    if (item.type === 'file') {
      return (
        <div
          key={item.path}
          className="flex items-center py-1 hover:bg-slate-100 dark:hover:bg-dark-surface rounded px-2 group"
          style={{ paddingLeft }}
        >
          <File className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-2" />
          <span className="text-sm truncate dark:text-dark-text">{item.path.split('/').pop()}</span>
          <span className="text-xs text-slate-400 ml-2 opacity-0 group-hover:opacity-100">
            {item.language}
          </span>
        </div>
      );
    }

    return (
      <div key={item.path}>
        <div
          className="flex items-center py-1 hover:bg-slate-100 dark:hover:bg-dark-surface rounded px-2 cursor-pointer"
          style={{ paddingLeft }}
          onClick={() => toggleFolder(item.path)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-1" />
          )}
          <Folder className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-2" />
          <span className="text-sm font-medium dark:text-dark-text">{item.path.split('/').pop() || item.name}</span>
        </div>
        {isExpanded && item.children && (
          <div>
            {item.children.map((child) => renderStructure(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg shadow-sm">
      <div className="border-b border-slate-200 dark:border-dark-border p-4">
        <div className="flex items-center gap-2">
          {getArchitectureIcon()}
          <div>
            <h2 className="text-lg font-medium text-slate-800 dark:text-dark-text">
              {config.architecture.charAt(0).toUpperCase() + config.architecture.slice(1)} Architecture
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preview of generated files and directories
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {generatedProject?.structure && renderStructure(generatedProject.structure)}
      </div>
      
      <div className="border-t border-slate-200 dark:border-dark-border p-4 flex justify-between items-center">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {generatedProject?.files.length || 0} files in project
        </span>
      </div>
    </div>
  );
};

export default ProjectPreview;
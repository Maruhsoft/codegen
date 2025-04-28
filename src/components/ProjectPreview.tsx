import React, { useState } from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { ProjectStructure } from '../types';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

const ProjectPreview: React.FC = () => {
  const { generatedProject } = useGenerator();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['', 'frontend', 'backend']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderStructure = (item: ProjectStructure, level = 0) => {
    const isExpanded = expandedPaths.has(item.path);
    const paddingLeft = `${level * 16}px`;

    if (item.type === 'file') {
      return (
        <div
          key={item.path}
          className="flex items-center py-1 hover:bg-slate-100 dark:hover:bg-dark-surface rounded px-2"
          style={{ paddingLeft }}
        >
          <File className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-2" />
          <span className="text-sm truncate dark:text-dark-text">{item.path.split('/').pop()}</span>
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
        <h2 className="text-lg font-medium text-slate-800 dark:text-dark-text">Project Structure</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Preview of generated files and directories</p>
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
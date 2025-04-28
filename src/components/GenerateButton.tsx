import React from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { Play, Loader } from 'lucide-react';
import { generateProject } from '../utils/codeGenerator';
import JSZip from 'jszip';

const GenerateButton: React.FC = () => {
  const { 
    schema, 
    isValidSchema, 
    config,
    setGeneratedProject,
    isGenerating,
    setIsGenerating,
    schemaFormat,
    generatedProject
  } = useGenerator();

  const handleGenerate = async () => {
    if (!isValidSchema) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await generateProject(schema, schemaFormat, config);
      setGeneratedProject(result);
    } catch (error) {
      console.error('Error generating project:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedProject) return;

    const zip = new JSZip();

    // Add all files to the zip
    generatedProject.files.forEach((file) => {
      zip.file(file.path, file.content);
    });

    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create download link
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-project.zip';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleGenerate}
        disabled={!isValidSchema || isGenerating}
        className={`flex items-center justify-center gap-2 px-8 py-3 text-white rounded-md transition-colors ${
          !isValidSchema || isGenerating
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        data-tooltip-id="generate-tooltip"
      >
        {isGenerating ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            <span>Generate Code</span>
          </>
        )}
      </button>

      {generatedProject && (
        <button
          onClick={handleDownload}
          className="text-blue-600 hover:text-blue-700 text-sm"
          data-tooltip-id="download-tooltip"
        >
          Download as ZIP
        </button>
      )}
    </div>
  );
};

export default GenerateButton;
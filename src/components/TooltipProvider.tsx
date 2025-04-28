import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

interface TooltipContextType {
  showTooltip: (id: string, content: string) => void;
  hideTooltip: (id: string) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

interface TooltipState {
  [key: string]: {
    content: string;
    visible: boolean;
  };
}

export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tooltips, setTooltips] = useState<TooltipState>({});

  const showTooltip = useCallback((id: string, content: string) => {
    setTooltips(prev => ({
      ...prev,
      [id]: { content, visible: true },
    }));
  }, []);

  const hideTooltip = useCallback((id: string) => {
    setTooltips(prev => ({
      ...prev,
      [id]: { ...prev[id], visible: false },
    }));
  }, []);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {Object.entries(tooltips).map(([id, tooltip]) => (
        <Tooltip
          key={id}
          id={id}
          content={tooltip.content}
          className="z-50 max-w-md bg-slate-800 dark:bg-slate-700 text-white p-2 rounded-md shadow-lg"
          place="top"
          delayShow={200}
          delayHide={100}
        />
      ))}
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};


import React, { useEffect } from 'react';
import { useGenerator } from '../hooks/useGenerator';
import { InputPanel } from './generator/InputPanel';
import { OutputPanel } from './generator/OutputPanel';

interface GeneratorProps {
  initialTab?: string;
}

export const Generator: React.FC<GeneratorProps> = ({ initialTab }) => {
  const { formState, uiState, dataState, actions } = useGenerator();

  // Sync sidebar navigation with internal tabs
  useEffect(() => {
    if (initialTab && ['script', 'assets', 'seo', 'video'].includes(initialTab)) {
      uiState.setActiveTab(initialTab as any);
    }
  }, [initialTab, uiState]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full overflow-hidden">
      {/* Input Column (Mission Control) */}
      <InputPanel 
        formState={formState}
        loading={uiState.loading}
        onGenerate={actions.handleGenerate}
      />

      {/* Output Column (Results) */}
      <OutputPanel 
        uiState={uiState}
        dataState={dataState}
        actions={actions}
        formState={formState} // Passing formState for activeChannelConfig
      />
    </div>
  );
};
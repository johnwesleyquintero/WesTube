
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChannelId } from '../types';

interface ProjectData {
  topic: string;
  channelId?: ChannelId;
  brainstormContext?: string;
}

interface ProjectContextType {
  projectData: ProjectData;
  setProjectData: (data: Partial<ProjectData>) => void;
  clearProjectData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectData, setProjectDataState] = useState<ProjectData>({
    topic: '',
  });

  const setProjectData = (data: Partial<ProjectData>) => {
    setProjectDataState(prev => ({ ...prev, ...data }));
  };

  const clearProjectData = () => {
    setProjectDataState({ topic: '' });
  };

  return (
    <ProjectContext.Provider value={{ projectData, setProjectData, clearProjectData }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

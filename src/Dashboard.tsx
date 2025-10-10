'use client';

import { useState } from 'react';
import { ViewType } from './types/nodes';
import Header from './layout/Header';
import Navigation from './layout/Navigation';
import MainContent from './layout/MainContent';
import { useWorkflow } from './hooks/useWorkflow';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('nodes');
  
  const {
    nodes,
    connections,
    handleNodeCreate,
    handleNodeUpdate,
    handleNodeDelete,
    handleConnectionCreate,
    handleConnectionUpdate,
    handleConnectionDelete,
  } = useWorkflow();

  return (
    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        nodeCount={nodes.length} 
        connectionCount={connections.length} 
      />
      
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      <MainContent
        currentView={currentView}
        nodes={nodes}
        connections={connections}
        onNodeCreate={handleNodeCreate}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={handleNodeDelete}
        onConnectionCreate={handleConnectionCreate}
        onConnectionUpdate={handleConnectionUpdate}
        onConnectionDelete={handleConnectionDelete}
      />
    </div>
  );
}
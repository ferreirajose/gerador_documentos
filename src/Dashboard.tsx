'use client';

import { useState } from 'react';
import { ViewType } from './types/nodes';
import Header from './layout/Header';
import Navigation from './layout/Navigation';
import MainContent from './layout/MainContent';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('nodes');
  
  return (
    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      <MainContent
        currentView={currentView} />
    </div>
  );
}
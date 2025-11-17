import { useState } from 'react';
import Header from './layout/Header';
import Navigation from './layout/Navigation';
import MainContent from './layout/MainContent';
import { ViewType } from './types/node';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('nodes');
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  
  // Função para expor o controle do bloqueio para componentes filhos
  const handleNavigationLock = (locked: boolean) => {
    setIsNavigationLocked(locked);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isNavigationLocked={isNavigationLocked}
      />
      
      <MainContent
        currentView={currentView}
        onNavigationLock={handleNavigationLock}
      />
    </div>
  );
}
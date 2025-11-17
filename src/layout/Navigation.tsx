import { ViewType } from '@/types/node';
import { RiNodeTree, RiLink, RiCodeLine, RiPlayCircleFill, RiLockLine } from '@remixicon/react'

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isNavigationLocked?: boolean; // Nova prop para bloquear navegação
}

export default function Navigation({ currentView, onViewChange, isNavigationLocked = false }: NavigationProps) {
  const navItems = [
    { key: 'nodes' as ViewType, icon: RiNodeTree, label: 'Gerenciar Nós' },
    { key: 'connections' as ViewType, icon: RiLink, label: 'Gerenciar Conexões' },
    { key: 'output-configuration' as ViewType, icon: RiCodeLine, label: 'Configuração de Saídas'},
    { key: 'execution' as ViewType, icon: RiPlayCircleFill, label: 'Executar Workflow' },
  ];

  const handleViewChange = (view: ViewType) => {
    if (isNavigationLocked) {
      // Não permite mudar de view quando a navegação está bloqueada
      return;
    }
    onViewChange(view);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isDisabled = isNavigationLocked && currentView !== item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => handleViewChange(item.key)}
                disabled={isDisabled}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  currentView === item.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : isDisabled
                    ? 'border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } ${isDisabled ? 'opacity-50' : ''}`}
                title={isDisabled ? 'Navegação bloqueada durante execução do workflow' : ''}
              >
                {isDisabled && <RiLockLine className="w-3 h-3 mr-1" />}
                <IconComponent className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>
        
        {/* Banner de aviso quando a navegação estiver bloqueada */}
        {isNavigationLocked && (
          <div className="bg-yellow-50 mb-4 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2 flex items-center">
            <RiLockLine className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-yellow-700 dark:text-yellow-300 text-sm">
              Navegação bloqueada durante a execução do workflow
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
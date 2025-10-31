import { ViewType } from '@/types/node';
import { RiNodeTree, RiLink, RiRecordCircleLine, RiCodeLine } from '@remixicon/react'

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { key: 'nodes' as ViewType, icon: RiNodeTree, label: 'Gerenciar Nós' },
    { key: 'connections' as ViewType, icon: RiLink, label: 'Gerenciar Conexões' },
    { key: 'output-configuration' as ViewType, icon: RiCodeLine, label: 'Configuração de Saídas'},
    { key: 'execution' as ViewType, icon: RiRecordCircleLine, label: 'Executar Workflow' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  currentView === item.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
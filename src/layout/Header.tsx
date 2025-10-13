import ThemeToggle from '@/components/common/ThemeToggle';
import { useWorkflow } from '@/context/WorkflowContext';
import { RiFlowChart } from '@remixicon/react'

export default function Header() {
  const { state } = useWorkflow();
    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <RiFlowChart className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciador de Workflow</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sistema CRUD para criação de workflows</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Nós: {state.nodes.length} | Conexões: {state.connections.length}
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
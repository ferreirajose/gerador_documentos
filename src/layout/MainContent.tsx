import { ViewType } from '@/types/node';
import ConnectionManager from '@/views/ConnectionManager';
import NodeManager from '@/views/NodeManager';
import OutputConfiguration from '@/views/OutputConfiguration';
import WorkflowExecution from '@/views/WorkflowExecution';
import WorkflowVisualization from '@/components/visualization/WorkflowVisualization';

interface MainContentProps {
  currentView: ViewType;
  onNavigationLock?: (locked: boolean) => void; // Nova prop
}

export default function MainContent({ currentView, onNavigationLock }: MainContentProps) {
  // Visualização precisa de altura fixa para o ReactFlow funcionar
  if (currentView === 'visualization') {
    return (
      <main className="w-full h-[calc(100vh-140px)]">
        <WorkflowVisualization />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentView === 'nodes' && (
        <NodeManager />
      )}

      {currentView === 'connections' && (
        <ConnectionManager />
      )}

      {currentView === 'output-configuration' && (
        <OutputConfiguration />
      )}

      {currentView === 'execution' && (
        <WorkflowExecution onNavigationLock={onNavigationLock} />
      )}
    </main>
  );
}
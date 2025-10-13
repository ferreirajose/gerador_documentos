import ConnectionManager from '@/components/ConnectionManager';
import WorkflowExecution from '@/components/WorkflowExecution';
import NodeManager from '@/components/NodeManager';
import { ViewType } from '@/types/nodes';
interface MainContentProps {
  currentView: ViewType;
}

export default function MainContent({ currentView }: MainContentProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {currentView === 'nodes' && (
        <NodeManager />
      )}

      {currentView === 'connections' && (
        <ConnectionManager />
      )}
      
      {currentView === 'execution' && (
        <WorkflowExecution />
      )}
      
    </main>
  );
}
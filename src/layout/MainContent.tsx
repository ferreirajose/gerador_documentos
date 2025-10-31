import { ViewType } from '@/types/node';
import ConnectionManager from '@/views/ConnectionManager';
import NodeManager from '@/views/NodeManager';
import OutputConfiguration from '@/views/OutputConfiguration';
import WorkflowExecution from '@/views/WorkflowExecution';
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

      {currentView === 'output-configuration' && (
        <OutputConfiguration />
      )}
      
      {currentView === 'execution' && (
        <WorkflowExecution />
      )}
      
    </main>
  );
}
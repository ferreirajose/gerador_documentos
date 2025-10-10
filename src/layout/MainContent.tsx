import { ViewType, Connection, Node } from '@/types/nodes';
import ConnectionManager from '@/components/ConnectionManager';
import WorkflowExecution from '@/components/WorkflowExecution';
import NodeManager from '@/components/NodeManager';

interface MainContentProps {
  currentView: ViewType;
  nodes: Node[];
  connections: Connection[];
  onNodeCreate: (node: Omit<Node, 'id' | 'createdAt'>) => void;
  onNodeUpdate: (id: string, updates: Partial<Node>) => void;
  onNodeDelete: (id: string) => void;
  onConnectionCreate: (connection: Omit<Connection, 'id' | 'createdAt'>) => void;
  onConnectionUpdate: (id: string, updates: Partial<Connection>) => void;
  onConnectionDelete: (id: string) => void;
}

export default function MainContent({
  currentView,
  nodes,
  connections,
  onNodeCreate,
  onNodeUpdate,
  onNodeDelete,
  onConnectionCreate,
  onConnectionUpdate,
  onConnectionDelete,
}: MainContentProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {currentView === 'nodes' && (
        <NodeManager
          nodes={nodes}
          onCreate={onNodeCreate}
          onUpdate={onNodeUpdate}
          onDelete={onNodeDelete}
        />
      )}

      {currentView === 'connections' && (
        <ConnectionManager
          nodes={nodes}
          connections={connections}
          onCreate={onConnectionCreate}
          onUpdate={onConnectionUpdate}
          onDelete={onConnectionDelete}
        />
      )}
      
      {currentView === 'execution' && (
        <WorkflowExecution
          nodes={nodes}
          connections={connections}
        />
      )}
      
    </main>
  );
}
import { Connection, Node } from '@/types/nodes';
import { useState } from 'react';

export function useWorkflow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const handleNodeCreate = (node: Omit<Node, 'id' | 'createdAt'>) => {
    const newNode: Node = {
      ...node,
      id: `node_${Date.now()}`,
      createdAt: new Date(),
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleNodeUpdate = (id: string, updates: Partial<Node>) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  };

  const handleNodeDelete = (id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    setConnections(prev => prev.filter(conn => 
      conn.fromNodeId !== id && conn.toNodeId !== id
    ));
  };

  const handleConnectionCreate = (connection: Omit<Connection, 'id' | 'createdAt'>) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn_${Date.now()}`,
      createdAt: new Date(),
    };
    setConnections(prev => [...prev, newConnection]);
  };

  const handleConnectionUpdate = (id: string, updates: Partial<Connection>) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, ...updates } : conn
    ));
  };

  const handleConnectionDelete = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  return {
    nodes,
    connections,
    handleNodeCreate,
    handleNodeUpdate,
    handleNodeDelete,
    handleConnectionCreate,
    handleConnectionUpdate,
    handleConnectionDelete,
  };
}
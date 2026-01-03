import { ViewType } from '@/types/node';
import ConnectionManager from '@/views/ConnectionManager';
import NodeManager from '@/views/NodeManager';
import OutputConfiguration from '@/views/OutputConfiguration';
import WorkflowExecution from '@/views/WorkflowExecution';
import WorkflowVisualization from '@/components/visualization/WorkflowVisualization';
import { RiArrowRightSLine, RiLayoutColumnLine } from '@remixicon/react';
import { useState, useRef, useCallback, useEffect } from 'react';

interface MainContentProps {
  currentView: ViewType;
  onNavigationLock?: (locked: boolean) => void; // Nova prop
}

export default function MainContent({ currentView, onNavigationLock }: MainContentProps) {
  // --- ESTADOS PARA O SPLIT VIEW ---
  const [isVizOpen, setIsVizOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(50); // Porcentagem inicial (50%)
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE REDIMENSIONAMENTO ---
  const startResizing = useCallback(() => {
    setIsResizing(true);
    onNavigationLock?.(true); // Opcional: Bloqueia navegação enquanto arrasta
  }, [onNavigationLock]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    onNavigationLock?.(false);
  }, [onNavigationLock]);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      // Calcula a nova largura baseada na posição do mouse em relação à largura total da janela
      const newWidth = (mouseMoveEvent.clientX / window.innerWidth) * 100;
      
      // Limites: Mínimo 20% e Máximo 80% para não quebrar o layout
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    // Adiciona os listeners na janela para que o arraste funcione mesmo se o mouse sair do componente
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // --- RENDERIZAÇÃO ---

  // LÓGICA DE TELA DIVIDIDA (SPLIT VIEW - AJUSTÁVEL)
  if (currentView === 'nodes' || currentView === 'connections') {
    return (
      <main 
        className={`flex w-full h-[calc(100vh-140px)] overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
      >
        
        {/* COLUNA DA ESQUERDA: EDITOR */}
        <div 
          ref={sidebarRef}
          style={{ width: isVizOpen ? `${leftWidth}%` : '100%' }}
          className="bg-white border-r border-gray-200 relative flex flex-col transition-[width] duration-75 ease-out"
        >
          {/* Header/Toolbar Local da Coluna Esquerda */}
          <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/50 shrink-0">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {currentView === 'nodes' ? 'Editor de Nós' : 'Conexões'}
             </span>
             
             {/* Botão de Toggle da Visualização */}
             <button 
               onClick={() => setIsVizOpen(!isVizOpen)}
               className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded transition-colors ${isVizOpen ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
               title={isVizOpen ? "Fechar Visualização" : "Abrir Visualização Lado a Lado"}
             >
                {isVizOpen ? (
                  <>Fechar Visualização <RiArrowRightSLine size={14} /></>
                ) : (
                  <>Abrir Visualização <RiLayoutColumnLine size={14} /></>
                )}
             </button>
          </div>

          {/* Conteúdo Scrollável */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex-1 overflow-y-auto custom-scrollbar p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 transition-all duration-300">
            {currentView === 'nodes' && <NodeManager />}
            {currentView === 'connections' && <ConnectionManager />}
          </div>
        </div>

        {/* BARRA DE REDIMENSIONAMENTO (DRAG HANDLE) */}
        {isVizOpen && (
          <div
            className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors z-10 flex items-center justify-center group"
            onMouseDown={startResizing}
          >
            {/* Indicador visual opcional no meio da barra */}
            <div className="h-8 w-1 bg-gray-300 rounded group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* COLUNA DA DIREITA: VISUALIZAÇÃO */}
        {isVizOpen && (
          <div className="flex-1 bg-gray-50 relative min-w-[200px]">
            <div className="absolute inset-0">
              <WorkflowVisualization />
            </div>
          </div>
        )}

      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentView === 'output-configuration' && (
        <OutputConfiguration />
      )}

      {currentView === 'execution' && (
        <WorkflowExecution onNavigationLock={onNavigationLock} />
      )}
    </main>
  );
}
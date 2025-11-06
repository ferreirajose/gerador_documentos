import { RiEyeLine, RiEyeOffLine, RiClipboardLine, RiCheckLine, RiErrorWarningLine, RiDownloadLine, RiArrowRightSLine, RiArrowDownSLine } from '@remixicon/react';
import { JSX, useState } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';

interface WorkflowOutputProps {
  isWorkflowVisible: boolean;
  setIsWorkflowVisible: (visible: boolean) => void;
}

interface JSONNode {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  key?: string;
  value: any;
  depth: number;
  isExpanded: boolean;
  path: string;
  children?: JSONNode[];
  parentType?: 'object' | 'array';
  index?: number;
  totalChildren?: number;
}

// Função para construir a árvore do JSON com estado de expansão
const buildJSONTree = (obj: any, depth = 0, path = 'root', parentType?: 'object' | 'array', index = 0, totalChildren = 1): JSONNode => {
  if (typeof obj === 'object' && obj !== null) {
    const isArray = Array.isArray(obj);
    const node: JSONNode = {
      type: isArray ? 'array' : 'object',
      value: obj,
      depth,
      isExpanded: depth < 2, // Expande automaticamente até o segundo nível
      path,
      parentType,
      index,
      totalChildren
    };

    if (isArray) {
      node.children = obj.map((item, idx) => 
        buildJSONTree(item, depth + 1, `${path}[${idx}]`, 'array', idx, obj.length)
      );
    } else {
      const entries = Object.entries(obj);
      node.children = entries.map(([key, value], idx) => ({
        ...buildJSONTree(value, depth + 1, `${path}.${key}`, 'object', idx, entries.length),
        key
      }));
    }

    return node;
  }

  return {
    type: obj === null ? 'null' : typeof obj as 'string' | 'number' | 'boolean',
    value: obj,
    depth,
    isExpanded: false,
    path,
    parentType,
    index,
    totalChildren
  };
};

// Função para renderizar a árvore do JSON com controles de expansão
const renderJSONTree = (
  node: JSONNode, 
  onToggle: (path: string) => void,
  expandedPaths: Set<string>
): JSX.Element => {
  const isExpanded = expandedPaths.has(node.path);
  const showComma = node.index !== undefined && node.totalChildren !== undefined && node.index < node.totalChildren - 1;
  
  const toggleExpand = () => {
    onToggle(node.path);
  };

  // Valores primitivos
  if (node.type !== 'object' && node.type !== 'array') {
    let valueColor = 'text-gray-800 dark:text-gray-200';
    let displayValue = node.value;

    if (node.type === 'string') {
      valueColor = 'text-[#d14] dark:text-[#f1fa8c]';
      displayValue = `"${node.value}"`;
    } else if (node.type === 'number') {
      valueColor = 'text-[#0000ff] dark:text-[#bd93f9]';
    } else if (node.type === 'boolean' || node.type === 'null') {
      valueColor = 'text-[#008000] dark:text-[#8be9fd]';
      displayValue = String(node.value);
    }

    return (
      <div className="flex">
        {node.key && (
          <span className="text-[#000] dark:text-[#ff79c6] mr-2">
            "{node.key}":
          </span>
        )}
        <span className={valueColor}>{displayValue}</span>
        {showComma && <span className="text-gray-800 dark:text-gray-200">,</span>}
      </div>
    );
  }

  // Objetos e arrays
  const isArray = node.type === 'array';
  const isEmpty = !node.children || node.children.length === 0;
  const bracketColor = 'text-gray-800 dark:text-gray-200';

  return (
    <div>
      <div className="flex items-start">
        {node.key && (
          <span className="text-[#000] dark:text-[#ff79c6] mr-2">
            "{node.key}":
          </span>
        )}
        
        {!isEmpty && (
          <button
            onClick={toggleExpand}
            className="mr-1 mt-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? (
              <RiArrowDownSLine className="w-4 h-4" />
            ) : (
              <RiArrowRightSLine className="w-4 h-4" />
            )}
          </button>
        )}
        
        <span className={bracketColor}>
          {isArray ? '[' : '{'}
          {isEmpty && (isArray ? ']' : '}')}
        </span>
      </div>

      {!isEmpty && isExpanded && node.children && (
        <div className="ml-6 border-l border-gray-200 dark:border-gray-700 pl-4">
          {node.children.map((child, index) => (
            <div key={child.path} className="my-1">
              {renderJSONTree(
                {
                  ...child,
                  index,
                  totalChildren: node.children!.length
                }, 
                onToggle, 
                expandedPaths
              )}
            </div>
          ))}
        </div>
      )}

      {!isEmpty && isExpanded && (
        <div className="flex">
          <span className={bracketColor}>
            {isArray ? ']' : '}'}
          </span>
          {showComma && <span className="text-gray-800 dark:text-gray-200">,</span>}
        </div>
      )}

      {!isEmpty && !isExpanded && (
        <div className="flex">
          <span className={`${bracketColor} ml-1`}>
            {isArray ? `... ${node.children.length} items]` : `... ${node.children.length} keys}`}
          </span>
          {showComma && <span className="text-gray-800 dark:text-gray-200">,</span>}
        </div>
      )}
    </div>
  );
};

// Função para formatar o JSON com controles de expansão
const formatJSONWithCollapse = (jsonString: string, expandedPaths: Set<string>, onToggle: (path: string) => void): JSX.Element => {
  try {
    const parsedJSON = JSON.parse(jsonString);
    const jsonTree = buildJSONTree(parsedJSON);
    
    return (
      <div className="font-mono text-sm">
        {renderJSONTree(jsonTree, onToggle, expandedPaths)}
      </div>
    );
    
  } catch (error) {
    console.error(error);
    return <div className="text-gray-800 dark:text-gray-200 font-mono text-sm">{jsonString}</div>;
  }
};

const WorkflowOutput: React.FC<WorkflowOutputProps> = ({
  isWorkflowVisible,
  setIsWorkflowVisible
}) => {
  const { getWorkflowJSON, validateWorkflow } = useWorkflow();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const workflowJSON = getWorkflowJSON();
  const validation = validateWorkflow();

  // Função para alternar expansão de um caminho
  const handleTogglePath = (path: string) => {
    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
      
      // Remove também todos os filhos deste caminho
      Array.from(newExpandedPaths).forEach(existingPath => {
        if (existingPath.startsWith(path + '.') || existingPath.startsWith(path + '[')) {
          newExpandedPaths.delete(existingPath);
        }
      });
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  // Função para expandir/contrair tudo
  const handleToggleAll = () => {
    if (expandedPaths.size > 0) {
      // Contrair tudo
      setExpandedPaths(new Set());
    } else {
      // Expandir tudo - precisamos construir a árvore para obter todos os caminhos
      try {
        const parsedJSON = JSON.parse(workflowJSON);
        const jsonTree = buildJSONTree(parsedJSON);
        const allPaths = new Set<string>();
        
        const collectPaths = (node: JSONNode) => {
          if (node.type === 'object' || node.type === 'array') {
            allPaths.add(node.path);
            node.children?.forEach(collectPaths);
          }
        };
        
        collectPaths(jsonTree);
        setExpandedPaths(allPaths);
      } catch (error) {
        console.error('Erro ao expandir tudo:', error);
      }
    }
  };

  // Função para copiar o JSON
  const handleCopyJSON = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(workflowJSON);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      
      // Fallback para execCommand
      const textArea = document.createElement("textarea");
      textArea.value = workflowJSON;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error("Falha ao copiar usando execCommand");
      }
      
    } catch (err) {
      console.error("Falha ao copiar JSON: ", err);
      setCopyError("Erro ao copiar. Tente selecionar e copiar manualmente.");
      setTimeout(() => setCopyError(null), 3000);
    }
  };

  // Função para baixar o JSON
  const handleDownloadJSON = () => {
    const blob = new Blob([workflowJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!workflowJSON) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Workflow Gerado
          </h3>
          
          {/* Status de Validação */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            validation.isValid 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {validation.isValid ? (
              <>
                <RiCheckLine className="w-3 h-3" />
                Válido
              </>
            ) : (
              <>
                <RiErrorWarningLine className="w-3 h-3" />
                {validation.errors.length} atenção
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Expandir/Contrair Tudo */}
          {isWorkflowVisible && (
            <button
              onClick={handleToggleAll}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
            >
              {expandedPaths.size > 0 ? 'Contrair Tudo' : 'Expandir Tudo'}
            </button>
          )}

          {/* Botão Copiar */}
          <button
            onClick={handleCopyJSON}
            disabled={copied}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600'
            }`}
          >
            <RiClipboardLine className="w-4 h-4" />
            {copied ? 'Copiado!' : 'Copiar'}
          </button>

          {/* Botão Download */}
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-md transition-colors dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
          >
            <RiDownloadLine className="w-4 h-4" />
            Download
          </button>

          {/* Botão Mostrar/Ocultar */}
          <button
            onClick={() => setIsWorkflowVisible(!isWorkflowVisible)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
          >
            {isWorkflowVisible ? (
              <>
                <RiEyeOffLine className="w-4 h-4" />
                Ocultar
              </>
            ) : (
              <>
                <RiEyeLine className="w-4 h-4" />
                Mostrar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensagem de erro de cópia */}
      {copyError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{copyError}</p>
        </div>
      )}

      {/* Lista de erros de validação */}
      {!validation.isValid && isWorkflowVisible && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Problemas de validação encontrados:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* JSON do Workflow */}
      {isWorkflowVisible && (
        <div className="relative">
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700 max-h-96">
            <code className="text-gray-800 dark:text-gray-200 font-mono">
              {formatJSONWithCollapse(workflowJSON, expandedPaths, handleTogglePath)}
            </code>
          </pre>
          
          {/* Contador de caracteres */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {workflowJSON.length} caracteres
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowOutput;
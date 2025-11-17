import { useChatBotController } from '@/hooks/useChatBotController';
import { RiCloseFill, RiRobotFill, RiSendPlaneFill, RiUserFill } from '@remixicon/react'
import { useEffect, useState } from 'react'

interface InteractionBotProps {
  onSendMessage?: (message: string) => void;
  interactionContext?: any;
  isWorkflowInteraction?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  autoOpen?: boolean;
}

export function InteractionBot({ 
  onSendMessage, 
  interactionContext, 
  isWorkflowInteraction = false,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  autoOpen = false
}: InteractionBotProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    
    // Usar controle externo ou interno do estado isOpen
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

    const {
        messages,
        inputValue,
        isLoading,
        messagesEndRef,
        inputRef,
        setInputValue,
        setMessages,
        handleSendMessage,
        handleKeyPress,
        formatTime,
    } = useChatBotController();

    // Efeito para abrir automaticamente quando necessário
    useEffect(() => {
        if (autoOpen && !isOpen) {
            console.log("Abrindo chat automaticamente");
            setIsOpen(true);
        }
    }, [autoOpen, isOpen, setIsOpen]);

    // Adicionar mensagem de contexto de workflow quando houver interação
    useEffect(() => {
        if (isWorkflowInteraction && interactionContext && isOpen) {
            console.log("Interação do workflow detectada:", interactionContext);
            
            const contextMessage = {
                id: 'workflow-context-' + Date.now(),
                text: `**${interactionContext.node}**\n\n${interactionContext.agent_message}\n\n_Por favor, responda para continuar o workflow:_`,
                sender: "bot" as const,
                timestamp: new Date(),
            };
            
            // Verifica se a mensagem de contexto já foi adicionada
            const hasContextMessage = messages.some(msg => 
                msg.id.startsWith('workflow-context') && 
                msg.text.includes(interactionContext.agent_message.substring(0, 50))
            );
            
            if (!hasContextMessage) {
                console.log("Adicionando mensagem de contexto do workflow");
                setMessages(prev => [...prev, contextMessage]);
            }
        }
    }, [isWorkflowInteraction, interactionContext, isOpen, messages, setMessages]);

    // Limpar mensagens quando o chat fechar ou quando não for mais interação de workflow
    useEffect(() => {
        if (!isOpen) {
            console.log("Limpando mensagens ao fechar chat");
            setMessages([]);
        }
    }, [isOpen, setMessages]);

    // Função para enviar mensagem
    const handleSend = () => {
        console.log("🎯 handleSend chamado:", {
            isWorkflowInteraction,
            hasOnSendMessage: !!onSendMessage,
            inputValue: inputValue.trim()
        });

        if (isWorkflowInteraction && onSendMessage) {
            console.log("Chamando onSendMessage para workflow");
            handleSendMessage(onSendMessage);
        } else {
            console.log("Modo padrão do chat - mensagem não será processada pelo workflow");
            // No modo padrão, apenas adiciona a mensagem do usuário
            handleSendMessage();
        }
    };

    // Função para handleKeyPress
    const handleKeyPressWrapper = (e: React.KeyboardEvent) => {
        handleKeyPress(e, isWorkflowInteraction ? onSendMessage : undefined);
    }

    // Função para fechar com ESC
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }

    // Última mensagem para aria-live
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isWorkflowInteraction 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-600 focus:ring-purple-500 dark:focus:ring-offset-gray-900 animate-pulse' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
                    }`}
                    aria-label={isWorkflowInteraction ? "Abrir chat para interação com workflow" : "Abrir chat de interação com assistente"}
                >
                    <RiRobotFill className="w-6 h-6" />
                    {isWorkflowInteraction && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                    )}
                    <span className="sr-only">Abrir chat</span>
                </button>
            </div>
        )
    }

    return (
        <div 
            role="dialog"
            aria-label={isWorkflowInteraction ? "Chat para interação com workflow" : "Chat com assistente de workflow"}
            aria-modal="true"
            onKeyDown={handleKeyDown}
            className="fixed bottom-6 right-6 w-100 h-[32rem] bg-card dark:bg-card/95 border border-border dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-sm dark:shadow-xl"
        >
            {/* Área para anunciar novas mensagens para screen readers */}
            <div 
                aria-live="polite"
                aria-atomic="false"
                className="sr-only"
            >
                {lastMessage && `Nova mensagem ${lastMessage.sender === 'user' ? 'enviada' : 'recebida'}: ${lastMessage.text}`}
            </div>

            {/* Header */}
            <div id="header" className={`px-6 py-4 flex items-center justify-between ${
                isWorkflowInteraction 
                    ? 'bg-purple-600 dark:bg-purple-700 text-white' 
                    : 'bg-blue-600 dark:bg-blue-700 text-white'
            }`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <RiRobotFill className="w-6 h-6" aria-hidden="true" />
                        <span className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
                            isWorkflowInteraction ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                        }`} aria-hidden="true"></span>
                    </div>
                    <div>
                        <h2 className="font-semibold block text-lg">
                            {isWorkflowInteraction ? 'Interação com Workflow' : 'Assistente de Workflow'}
                        </h2>
                        <span className="text-xs opacity-80">
                            {isWorkflowInteraction ? 'Aguardando sua resposta' : 'Online'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white-20 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 dark:focus:ring-offset-purple-700"
                        aria-label="Fechar chat de conversa"
                    >
                        <RiCloseFill className="w-5 h-5" aria-hidden="true" />
                        <span className="sr-only">Fechar chat</span>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                id="messages-area"
                role="log"
                aria-label="Histórico de mensagens"
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900"
            >
                {messages.length === 0 && !isWorkflowInteraction && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <RiRobotFill className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Inicie uma conversa com o assistente</p>
                        </div>
                    </div>
                )}
                
                {messages.map((message) => (
                    <div 
                        key={message.id} 
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                        role="article"
                        aria-label={`Mensagem de ${message.sender === 'user' ? 'você' : 'assistente'} às ${formatTime(message.timestamp)}`}
                    >
                        {message.sender === "bot" && (
                            <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isWorkflowInteraction ? 'bg-purple-600 dark:bg-purple-700' : 'bg-blue-600 dark:bg-blue-700'
                                }`}
                                aria-hidden="true"
                            >
                                <RiRobotFill className="w-3 h-3 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                                message.sender === "user"
                                    ? isWorkflowInteraction 
                                        ? "bg-purple-600 dark:bg-purple-700 text-white rounded-br-md shadow-sm"
                                        : "bg-blue-600 dark:bg-blue-700 text-white rounded-br-md shadow-sm"
                                    : "bg-muted dark:bg-gray-800 text-foreground dark:text-gray-100 rounded-bl-md border dark:border-gray-700 shadow-sm"
                            }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                            <span className={`text-xs opacity-70 mt-2 block text-right ${
                                message.sender === "user" 
                                    ? isWorkflowInteraction ? "text-purple-100" : "text-blue-100"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}>
                                {formatTime(message.timestamp)}
                            </span>
                        </div>
                        {message.sender === "user" && (
                            <div 
                                className="w-6 h-6 bg-muted-foreground dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0"
                                aria-hidden="true"
                            >
                                <RiUserFill className="w-3 h-3 text-background dark:text-gray-100" />
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {/* Input Area */}
            <div id="footer" className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/80 backdrop-blur-sm">
                <div id="input-area" className="flex gap-2 items-center">
                    <label htmlFor="chat-input" className="sr-only">
                        {isWorkflowInteraction ? 'Digite sua resposta para continuar o workflow' : 'Digite sua mensagem'}
                    </label>
                    <textarea
                        id="chat-input"
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPressWrapper}
                        placeholder={isWorkflowInteraction ? 'Digite sua resposta para continuar...' : 'Digite sua mensagem...'}
                        className="flex-1 px-4 py-3 border border-input dark:border-gray-600 rounded-xl bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500/50 dark:focus:border-purple-400/50 transition-all resize-none min-h-[3rem] max-h-32"
                        disabled={isLoading}
                        aria-describedby="chat-instructions"
                        rows={3}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isWorkflowInteraction
                                ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 focus:ring-purple-500 focus:ring-offset-purple-100 dark:focus:ring-offset-gray-800'
                                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500 focus:ring-offset-blue-100 dark:focus:ring-offset-gray-800'
                        } text-white`}
                        aria-label={isWorkflowInteraction ? 'Enviar resposta para workflow' : 'Enviar mensagem'}
                    >
                        <RiSendPlaneFill className="w-5 h-5" aria-hidden="true" />
                        <span className="sr-only">Enviar</span>
                    </button>
                </div>
                <p id="chat-instructions" className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                    {isWorkflowInteraction 
                        ? 'Digite sua resposta para continuar a execução do workflow. Pressione Enter para enviar.'
                        : 'Digite sua pergunta sobre workflows e processos. Pressione Enter para enviar.'
                    }
                </p>
            </div>
        </div>
    )
}
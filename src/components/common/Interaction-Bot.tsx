"use client"

import { RiCloseFill, RiRobotFill, RiSendPlaneFill, RiUserFill } from '@remixicon/react'
import { useChatBotController } from '@/hooks/useChatBotController'

export function InteractionBot() {
    const {
        isOpen,
        setIsOpen,
        messages,
        inputValue,
        setInputValue,
        isLoading,
        isTyping,
        messagesEndRef,
        inputRef,
        handleSendMessage,
        handleKeyPress,
        formatTime,
    } = useChatBotController()

    // Função para fechar com ESC
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    // Última mensagem para aria-live
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 dark:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-label="Abrir chat de interação com assistente de workflow"
                >
                    <RiRobotFill className="w-6 h-6" />
                    <span className="sr-only">Abrir chat</span>
                </button>
            </div>
        )
    }

    return (
        <div 
            role="dialog"
            aria-label="Chat com assistente de workflow"
            aria-modal="true"
            onKeyDown={handleKeyDown}
            className="fixed bottom-6 right-6 w-96 h-[32rem] bg-card dark:bg-card/95 border border-border dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-sm dark:shadow-xl"
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
            <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <RiRobotFill className="w-6 h-6" aria-hidden="true" />
                        <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full" aria-hidden="true"></span>
                    </div>
                    <div>
                        <h2 className="font-semibold block text-lg">Assistente de Workflow</h2>
                        <span className="text-xs opacity-80">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white-20 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 dark:focus:ring-offset-blue-700"
                        aria-label="Fechar chat de conversa"
                    >
                        <RiCloseFill className="w-5 h-5" aria-hidden="true" />
                        <span className="sr-only">Fechar chat</span>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                role="log"
                aria-label="Histórico de mensagens"
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/30 dark:from-gray-900 dark:to-gray-800/30"
            >
                {messages.map((message) => (
                    <div 
                        key={message.id} 
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                        role="article"
                        aria-label={`Mensagem de ${message.sender === 'user' ? 'você' : 'assistente'} às ${formatTime(message.timestamp)}`}
                    >
                        {message.sender === "bot" && (
                            <div 
                                className="w-6 h-6 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0"
                                aria-hidden="true"
                            >
                                <RiRobotFill className="w-3 h-3 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                                message.sender === "user"
                                    ? "bg-blue-600 dark:bg-blue-700 text-white rounded-br-md shadow-sm"
                                    : "bg-muted dark:bg-gray-800 text-foreground dark:text-gray-100 rounded-bl-md border dark:border-gray-700 shadow-sm"
                            }`}
                        >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <span className={`text-xs opacity-70 mt-2 block text-right ${
                                message.sender === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
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
                
                {/* Indicador "pensando" */}
                {isTyping && (
                    <div 
                        className="flex justify-start items-end gap-2"
                        role="status"
                        aria-label="Assistente está digitando uma resposta"
                    >
                        <div 
                            className="w-6 h-6 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0"
                            aria-hidden="true"
                        >
                            <RiRobotFill className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-muted dark:bg-gray-800 text-foreground dark:text-gray-100 px-4 py-3 rounded-2xl rounded-bl-md border dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground dark:text-gray-400 mr-2">pensando</span>
                                <div className="flex gap-1" aria-hidden="true">
                                    <span className="w-2 h-2 bg-foreground/50 dark:bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-foreground/50 dark:bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 bg-foreground/50 dark:bg-gray-400 rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 dark:border-gray-700 p-4 bg-card/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex gap-2">
                    <label htmlFor="chat-input" className="sr-only">
                        Digite sua mensagem
                    </label>
                    <input
                        id="chat-input"
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-3 border border-input dark:border-gray-600 rounded-xl bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500/50 dark:focus:border-blue-400/50 transition-all"
                        disabled={isLoading}
                        aria-describedby="chat-instructions"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        aria-label="Enviar mensagem"
                    >
                        <RiSendPlaneFill className="w-5 h-5" aria-hidden="true" />
                        <span className="sr-only">Enviar</span>
                    </button>
                </div>
                <p id="chat-instructions" className="text-xs text-muted-foreground dark:text-gray-400 mt-2 text-center">
                    Digite sua pergunta sobre workflows e processos. Pressione Enter para enviar.
                </p>
            </div>
        </div>
    )
}
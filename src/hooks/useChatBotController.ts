import { useCallback, useRef, useEffect, useState } from "react";
import { useWorkflow, ChatMessage } from '@/context/WorkflowContext';

interface UseWorkflowChatReturn {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  handleSendMessage: (onSend?: (message: string) => void) => void;
  handleKeyPress: (e: React.KeyboardEvent, onSend?: (message: string) => void) => void;
  formatTime: (date: Date) => string;
  addBotMessage: (text: string) => void;
  clearMessages: () => void;
}

export function useChatBotController(): UseWorkflowChatReturn {
  const { 
    state, 
    addChatMessage, 
    setChatInputValue, 
    clearChatMessages, 
    setChatMessages 
  } = useWorkflow();

  // Usar estado global do chat
  const messages = Array.isArray(state.chat.messages) ? state.chat.messages : [];
  const inputValue = typeof state.chat.inputValue === 'string' ? state.chat.inputValue : '';

  
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focar no input quando o chat abrir ou quando mensagens mudarem
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [messages, state.chat.isChatOpen]);

  const handleSendMessage = useCallback((onSend?: (message: string) => void) => {
    const message = inputValue.trim();
    if (!message) return;

    // Adiciona mensagem do usuário ao chat usando estado global
    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setChatInputValue("");
    
    console.log("Enviando mensagem para workflow:", message);
    
    // Chama a função de callback do workflow se for fornecida
    if (onSend) {
      setIsLoading(true);
      try {
        onSend(message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [inputValue, addChatMessage, setChatInputValue]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, onSend?: (message: string) => void) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(onSend);
      }
    },
    [handleSendMessage]
  );

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const addBotMessage = useCallback((text: string) => {
    const botMessage: ChatMessage = {
      id: 'bot-' + Date.now(),
      text: text,
      sender: "bot",
      timestamp: new Date(),
    };
    addChatMessage(botMessage);
  }, [addChatMessage]);

  const clearMessages = useCallback(() => {
    clearChatMessages();
  }, [clearChatMessages]);

  return {
    messages,
    setMessages: setChatMessages, 
    inputValue,
    setInputValue: setChatInputValue,
    isLoading,
    messagesEndRef: messagesEndRef as React.RefObject<HTMLDivElement | null>,
    inputRef,
    handleSendMessage,
    handleKeyPress,
    formatTime,
    addBotMessage,
    clearMessages, 
  };
}
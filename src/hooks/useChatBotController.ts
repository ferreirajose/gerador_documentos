// hooks/useWorkflowChat.ts
import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface UseWorkflowChatReturn {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleSendMessage: (onSend?: (message: string) => void) => void;
  handleKeyPress: (e: React.KeyboardEvent, onSend?: (message: string) => void) => void;
  formatTime: (date: Date) => string;
  addBotMessage: (text: string) => void;
}

export function useChatBotController(): UseWorkflowChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focar no input quando o chat abrir
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [messages]); // Focar quando mensagens mudarem

  const handleSendMessage = useCallback((onSend?: (message: string) => void) => {
    const message = inputValue.trim();
    if (!message) return;

    // Adiciona mensagem do usuário ao chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    console.log("Enviando mensagem para workflow:", message);
    
    // Chama a função de callback do workflow se for fornecida
    if (onSend) {
      onSend(message);
    }
  }, [inputValue]);

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
    const botMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMessage]);
  }, []);

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isLoading,
    messagesEndRef: messagesEndRef as React.RefObject<HTMLDivElement | null>,
    inputRef: inputRef as React.RefObject<HTMLInputElement | null>,
    handleSendMessage,
    handleKeyPress,
    formatTime,
    addBotMessage,
  };
}
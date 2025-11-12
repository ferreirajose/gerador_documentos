import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface UseChatBotReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleSendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  formatTime: (date: Date) => string;
  clearChat: () => void;
}

export function useChatBotController(): UseChatBotReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Estou aqui para ajudar com a execução do seu workflow. Você pode me fazer perguntas sobre o processo ou solicitar ajuda.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const generateBotResponse = useCallback((userInput: string): string => {
    if (userInput.includes("workflow") || userInput.includes("processo")) {
      return "Posso ajudar você a entender e executar workflows. Qual etapa específica você gostaria de conhecer?";
    } else if (userInput.includes("erro") || userInput.includes("problema")) {
      return "Entendo que você está enfrentando um problema. Vou ajudar a identificar e resolver a questão.";
    } else if (
      userInput.includes("obrigado") ||
      userInput.includes("obrigada") ||
      userInput.includes("thanks")
    ) {
      return "De nada! Estou aqui para ajudar. Se tiver mais alguma dúvida, é só perguntar!";
    } else if (
      userInput.includes("ola") ||
      userInput.includes("oi") ||
      userInput.includes("hi")
    ) {
      return "Olá! Como posso ajudá-lo com seu workflow hoje?";
    } else {
      const responses = [
        "Entendi sua pergunta. Como posso ajudá-lo com o workflow?",
        "Posso explicar mais sobre esse tópico. O que específico você gostaria de saber?",
        "Excelente pergunta! Vou ajudar você com isso.",
        "Com certeza! Posso fornecer informações detalhadas sobre esse assunto.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // Simular tempo de "digitação" do bot
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Delay variável para parecer mais natural
  }, [inputValue, isLoading, generateBotResponse]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
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

  return {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isLoading,
    isTyping,
    messagesEndRef: messagesEndRef as React.RefObject<HTMLDivElement | null>,
    inputRef: inputRef as React.RefObject<HTMLInputElement | null>,
    handleSendMessage,
    handleKeyPress,
    formatTime,
  };
}

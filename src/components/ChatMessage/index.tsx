import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { Bot, User } from 'lucide-react';
import { MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageActions } from './MessageActions';

interface ChatMessageProps {
  message: Message;
  isSpeaking?: boolean;
  onExecuteCode: (blockId: string, code: string) => void;
  onRegenerate?: () => void;
  isLastAssistantMessage?: boolean;
  onSpeak?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isSpeaking,
  onExecuteCode,
  onRegenerate,
  isLastAssistantMessage,
  onSpeak,
}) => {
  const isBot = message.role === 'assistant';
  const [isRegenerating, setIsRegenerating] = useState(false);
  const regenerationTimeoutRef = useRef<number>();

  useEffect(() => {
    if (isRegenerating && message.content !== "Regenerating...") {
      setIsRegenerating(false);
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
    }
  }, [message.content, isRegenerating]);

  useEffect(() => {
    return () => {
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
    };
  }, []);

  const handleSpeak = () => {
    if (onSpeak && isBot) {
      const cleanText = message.content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/[*_~`]/g, '')
        .replace(/\n\n/g, '. ')
        .replace(/\n/g, ' ')
        .trim();
      
      onSpeak(cleanText);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && !isRegenerating) {
      setIsRegenerating(true);
      onRegenerate();
      
      regenerationTimeoutRef.current = window.setTimeout(() => {
        setIsRegenerating(false);
      }, 10000);
    }
  };

  return (
    <div className={`flex gap-3 md:gap-6 p-3 md:p-6 rounded-xl md:rounded-2xl transition-all message-bubble ${
      isBot ? 'assistant' : ''
    }`}>
      <div className={`shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center cyber-border ${
        isBot ? 'bg-[#00f3ff]/10 text-[#00f3ff]' : 'bg-[#bc13fe]/10 text-[#bc13fe]'
      }`}>
        {isBot ? <Bot className="w-4 h-4 md:w-6 md:h-6" /> : <User className="w-4 h-4 md:w-6 md:h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <MessageHeader 
          isBot={isBot} 
          isVoice={message.isVoice} 
          isSpeaking={isSpeaking}
          onSpeak={isBot ? handleSpeak : undefined}
        />
        
        <MessageContent 
          message={message} 
          onExecuteCode={onExecuteCode}
          isBot={isBot}
        />
        
        {isBot && isLastAssistantMessage && (
          <MessageActions 
            content={message.content}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        )}
      </div>
    </div>
  );
};
import React, { useEffect, useRef } from 'react';
import { Message, Sender, ControlMode } from '../types';
import { Bot, User, Skull, Ghost, ShieldAlert, Coffee } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
}

const ModeIcon = ({ mode }: { mode?: ControlMode }) => {
  if (!mode) return null;
  switch (mode) {
    case ControlMode.ATTACK: return <Skull size={10} className="text-red-500" />;
    case ControlMode.STEALTH: return <Ghost size={10} className="text-blue-400" />;
    case ControlMode.PERSISTENT: return <ShieldAlert size={10} className="text-amber-500" />;
    case ControlMode.CRUISE: return <Coffee size={10} className="text-green-500" />;
    default: return null;
  }
};

export const MessageList: React.FC<MessageListProps> = ({ messages, isThinking }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 no-scrollbar">
      {messages.map((msg) => {
        const isTarget = msg.sender === Sender.TARGET;
        const isAgent = msg.sender === Sender.AI_AGENT;

        return (
          <div
            key={msg.id}
            className={`flex w-full ${isTarget ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[85%] flex flex-col ${isTarget ? 'items-start' : 'items-end'}`}>
              
              <div
                className={`
                  px-4 py-3 text-[15px] leading-relaxed relative
                  ${isTarget 
                    ? 'bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none' 
                    : isAgent
                      ? 'bg-zinc-900 text-green-400 font-mono rounded-2xl rounded-tr-none border border-green-900/40' 
                      : 'bg-zinc-100 text-black rounded-2xl rounded-tr-none'
                  }
                `}
              >
                {msg.text}
              </div>
              
              {/* Meta info below message for mobile feel */}
              <div className="flex items-center gap-1 mt-1 px-1">
                {isAgent && <ModeIcon mode={msg.modeUsed} />}
                <span className="text-[10px] text-zinc-600 font-medium">
                    {isTarget ? 'TARGET' : (isAgent ? 'AUTO' : 'YOU')}
                </span>
                {isAgent && msg.modeUsed === ControlMode.ATTACK && (
                    <span className="text-[9px] text-red-700 font-mono tracking-tighter">FLOODING</span>
                )}
              </div>

            </div>
          </div>
        );
      })}
      
      {isThinking && (
        <div className="flex w-full justify-start animate-pulse">
           <div className="bg-zinc-800/50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75"></div>
             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
           </div>
        </div>
      )}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
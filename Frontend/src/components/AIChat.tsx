import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  messages: Message[];
  isTyping: boolean;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  messages,
  isTyping,
  chatInput,
  onChatInputChange,
  onSendMessage,
  onKeyPress,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50'
              }`}
              style={{ fontSize: '14px' }}
            >
              {message.type === 'user' ? (
                <div>
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="prose prose-sm dark:prose-invert max-w-none
                    prose-p:my-2 prose-p:leading-relaxed prose-p:text-foreground prose-p:first:mt-0 prose-p:last:mb-0
                    prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-headings:first:mt-0
                    prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                    prose-strong:font-bold prose-strong:text-foreground
                    prose-em:italic prose-em:text-foreground
                    prose-code:text-primary prose-code:bg-background/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                    prose-pre:bg-background/80 prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded-lg prose-pre:my-3 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border
                    prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:block
                    prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1 prose-ol:block
                    prose-li:text-foreground prose-li:leading-relaxed prose-li:marker:text-foreground/70 prose-li:block
                    prose-a:text-primary prose-a:underline prose-a:font-medium hover:prose-a:text-primary/80
                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-2
                    prose-hr:border-border prose-hr:my-4
                    prose-table:border-collapse prose-table:w-full prose-table:my-3
                    prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-th:text-xs
                    prose-td:border prose-td:border-border prose-td:p-2 prose-td:text-sm">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        p: ({node, children, ...props}) => <p className="block" {...props}>{children}</p>,
                        ul: ({node, children, ...props}) => <ul className="block my-2" {...props}>{children}</ul>,
                        ol: ({node, children, ...props}) => <ol className="block my-2" {...props}>{children}</ol>,
                        li: ({node, children, ...props}) => <li className="block" {...props}>{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs mt-2 opacity-70 text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted/50 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex gap-2 items-end">
          <textarea
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask about your system design..."
            className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 text-sm bg-background border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={isTyping}
            rows={1}
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted-foreground)) transparent'
            }}
          />
          <button
            onClick={onSendMessage}
            disabled={!chatInput.trim() || isTyping}
            className="h-11 px-5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          💡 I can analyze your current diagram and provide contextual advice
        </p>
      </div>
    </div>
  );
};

import { SendHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { sendPrompt, ChatMessage } from "../../api/aiAPI";
import EditableTranscript from "./EditableTranscript";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import DinoLoader from "../../components/Dino/Dino.jsx";

interface CodeProps {
  node?: any;
  inline?: any;
  className?: any;
  children?: any;
}

const NonDinoLoader: React.FC = () => {
  return (
    <div className="text-left mb-4">
      <div className="inline-block p-3 rounded-lg bg-neutral-700 text-white rounded-tl-none">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
          <div
            className="w-2 h-2 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function VirtualAdvisor() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "Hi! I'm your virtual academic advisor. How can I help you with your degree plan today?",
      timestamp: new Date(),
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendPrompt(userMessage.content);

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex gap-6 h-full">
      <div className="w-1/2 h-full">
        <EditableTranscript />
      </div>
      <div className="flex flex-col gap-6 chatbox w-1/2 justify-between overflow-none">
        <div
          ref={chatContainerRef}
          className="w-full p-4 overflow-y-scroll h-full"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.type === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.type === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-neutral-700 text-white rounded-tl-none"
                }`}
              >
                {message.type === "user" ? (
                  message.content
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }: CodeProps) {
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <SyntaxHighlighter
                            className="markdown-content"
                            language={match[1]}
                            PreTag="div"
                            {...props}
                            style={vscDarkPlus}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      a: ({ node, ...props }) => (
                        <a
                          className="text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-4 my-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-4 my-2" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-white/30 pl-2 my-2 italic"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          {isLoading && <DinoLoader />}
        </div>
        <form onSubmit={handleSubmit} className="relative w-full">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="bg-neutral-800 rounded-full p-3 px-4 w-full border border-white/30 relative"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-0 top-0 h-full px-4 text-white/50 hover:text-white/100 duration-150 rounded-r-full hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendHorizontal size={24} strokeWidth={1} />
          </button>
        </form>
      </div>
    </div>
  );
}

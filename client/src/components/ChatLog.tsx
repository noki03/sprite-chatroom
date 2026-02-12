import { useEffect, useRef, useState } from "react";

interface ChatEntry {
  id: string;
  text: string;
  isSystem?: boolean;
}

// Added localId to props
export const ChatLog = ({
  messages,
  localId,
}: {
  messages: ChatEntry[];
  localId?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isCollapsed) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isCollapsed]);

  return (
    <div className="pointer-events-auto w-80 flex flex-col transition-all duration-300 ease-in-out">
      <div className="bg-black/80 border-x border-t border-white/10 rounded-t-lg px-2 py-1 flex justify-between items-center">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
          Room Chat
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white/40 hover:text-yellow-500 text-xs px-1 transition-colors"
        >
          {isCollapsed ? "[+]" : "[-]"}
        </button>
      </div>

      <div
        className={`bg-black/60 border-x border-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "h-0 opacity-0" : "h-48 p-2 opacity-100"
        }`}
      >
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
          {messages.map((msg, i) => {
            const isMe = msg.id === localId;

            return (
              <div
                key={i}
                className={`px-2 py-0.5 mb-1 rounded text-[13px] leading-tight border-l-2 ${
                  msg.isSystem
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-300 italic"
                    : isMe
                      ? "bg-emerald-500/10 border-emerald-500/50 text-white/90" // Your style
                      : "bg-white/5 border-transparent text-white/90" // Others style
                }`}
              >
                {!msg.isSystem && (
                  <span
                    className={`font-mono font-bold mr-1 text-[11px] ${
                      isMe ? "text-emerald-400" : "text-yellow-500/80"
                    }`}
                  >
                    {isMe ? "[YOU]" : `[${msg.id.substring(0, 4)}]`}:
                  </span>
                )}
                <span className="wrap-break-word select-text">{msg.text}</span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
};

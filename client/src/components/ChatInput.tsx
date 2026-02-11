import React, { forwardRef } from "react";

interface ChatInputProps {
  message: string;
  setMessage: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBlur?: () => void;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ message, setMessage, onSubmit, onBlur }, ref) => {
    return (
      <form onSubmit={onSubmit} className="pointer-events-auto w-full">
        <div className="relative group">
          <input
            ref={ref}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={onBlur}
            placeholder="Press Enter to chat..."
            className="w-full bg-black/60 border border-white/10 px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white transition-all shadow-xl text-sm"
            maxLength={60}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-white/20 font-bold group-focus-within:hidden pointer-events-none">
            ENTER
          </div>
        </div>
      </form>
    );
  },
);

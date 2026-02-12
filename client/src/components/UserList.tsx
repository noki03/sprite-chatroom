interface UserListProps {
  players: Record<string, any>;
  localId?: string;
}

export const UserList = ({ players, localId }: UserListProps) => {
  const userIds = Object.keys(players);

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="bg-neutral-800 border border-white/10 rounded-t-lg px-3 py-2 flex justify-between items-center">
        <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
          Users
        </span>
        <span className="bg-yellow-500 text-neutral-900 text-[10px] px-2 py-0.5 rounded-full font-black">
          {userIds.length}
        </span>
      </div>

      {/* List Body */}
      <div className="bg-neutral-800/40 border-x border-b border-white/5 rounded-b-lg p-2 min-h-137.5 max-h-150 overflow-y-auto custom-scrollbar">
        {userIds.map((id) => {
          const isMe = id === localId;
          return (
            <div
              key={id}
              className="flex items-center gap-2 p-2 mb-1 rounded-md bg-white/5 hover:bg-white/10 transition-all group"
            >
              {/* Status Dot: Emerald for everyone */}
              <div
                className={`w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]`}
              />

              {/* Name: Emerald text only for 'You' */}
              <span
                className={`text-sm truncate ${
                  isMe
                    ? "text-emerald-400 font-bold"
                    : "text-neutral-300 group-hover:text-white"
                }`}
              >
                {isMe ? "You" : id.substring(0, 4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

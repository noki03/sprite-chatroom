import { useState } from "react";

const ADJECTIVES = ["Neon", "Cyber", "Mega", "Ghost", "Pixel", "Turbo"];
const NOUNS = ["Runner", "Spirit", "User", "Gamer", "Phantom", "Link"];

export const JoinScreen = ({
  onJoin,
}: {
  onJoin: (name: string, color: string) => void;
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#10b981");
  const [isJoining, setIsJoining] = useState(false);

  const colors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#ec4899",
  ];

  const handleRandom = () => {
    const randomName = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}${NOUNS[Math.floor(Math.random() * NOUNS.length)]}${Math.floor(Math.random() * 99)}`;
    setName(randomName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isJoining) {
      setIsJoining(true); // This shows the spinner immediately
      onJoin(name.trim(), color);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-neutral-950/90 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className={`bg-neutral-800 p-8 rounded-2xl border border-white/10 shadow-2xl w-96 transition-all duration-300 ${
          isJoining ? "scale-95 opacity-50" : "scale-100 opacity-100"
        }`}
      >
        {isJoining ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
            <p className="text-yellow-500 font-bold uppercase tracking-widest text-sm">
              Joining Room...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white text-center uppercase">
              Character Setup
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-white/40">
                Nickname
              </label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 p-2.5 rounded-lg text-white outline-none focus:border-yellow-500"
                  placeholder="Who are you?"
                  maxLength={12}
                />
                <button
                  type="button"
                  onClick={handleRandom}
                  className="bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/10 transition-colors"
                >
                  🎲
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-white/40">
                Name Color
              </label>
              <div className="flex justify-between">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? "scale-125 border-2 border-white" : "opacity-40 hover:opacity-100"}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-600 text-neutral-900 font-black py-3 rounded-lg uppercase transition-all"
            >
              Enter Room
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

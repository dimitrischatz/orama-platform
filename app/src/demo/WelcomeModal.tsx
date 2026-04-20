import { useState, useEffect } from 'react';

interface WelcomeModalProps {
  demoName: string;
  intro: string;
  ideas: string[];
}

export function WelcomeModal({ demoName, intro, ideas }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `orama-demo-welcome-${demoName}`;
    if (!sessionStorage.getItem(key)) {
      setOpen(true);
      sessionStorage.setItem(key, '1');
    }
  }, [demoName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
          <span className="text-lg font-bold text-orange-500">O</span>
        </div>

        <h2 className="mb-1 text-lg font-bold text-gray-900">
          Welcome to the {demoName}
        </h2>
        <p className="mb-5 text-sm text-gray-500 leading-relaxed">
          {intro} Orama is in the <span className="font-medium text-gray-700">bottom right</span> — click it and type what you need.
        </p>

        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Things to try</p>
          <div className="space-y-1.5">
            {ideas.map((idea, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-orange-400 text-xs">&#x2192;</span>
                <span className="text-sm text-gray-600">{idea}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          Got it, let me try
        </button>
      </div>
    </div>
  );
}

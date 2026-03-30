import { useState } from "react";
import {
  getApiKeys,
  generateApiKey,
  revokeApiKey,
  useQuery,
} from "wasp/client/operations";
import type { User } from "wasp/entities";
import { Key, Trash2, Copy, Eye, EyeOff, Plus } from "lucide-react";
import { useToast } from "../client/hooks/use-toast";

export default function ApiKeysPage(_props: { user: User }) {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">
        API Keys
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Manage keys for authenticating the Orama SDK
      </p>

      <ApiKeysSection />
    </div>
  );
}

function ApiKeysSection() {
  const { data: apiKeys, isLoading } = useQuery(getApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return;
    try {
      await generateApiKey({ name: newKeyName.trim() });
      setNewKeyName("");
      setShowForm(false);
      toast({ title: "API key generated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeApiKey({ id });
      toast({ title: "API key revoked" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to clipboard" });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Generate Key
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
          <p className="mb-3 text-sm font-medium text-white">
            New API Key
          </p>
          <div className="flex gap-3">
            <input
              placeholder="Key name (e.g. My App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="flex-1 rounded-lg border border-white/[0.07] bg-[#18181c] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              autoFocus
            />
            <button
              onClick={handleGenerate}
              disabled={!newKeyName.trim()}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              Generate
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewKeyName("");
              }}
              className="rounded-lg border border-white/[0.07] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
        </div>
      ) : !apiKeys?.length ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-[#111114] py-16 text-center">
          <Key className="mx-auto mb-4 h-10 w-10 text-zinc-400" />
          <p className="mb-2 text-sm font-medium text-zinc-300">
            No API keys yet
          </p>
          <p className="text-sm text-zinc-400">
            Generate a key to authenticate the Orama SDK
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {apiKey.name}
                  </p>
                  <p className="mt-2 font-mono text-xs text-zinc-500">
                    {visibleKeys.has(apiKey.id)
                      ? apiKey.key
                      : `${apiKey.key.slice(0, 12)}${"•".repeat(20)}`}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">
                    Created{" "}
                    {new Date(apiKey.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-1">
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyKey(apiKey.key)}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRevoke(apiKey.id)}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

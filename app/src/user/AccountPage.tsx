import { useState } from "react";
import { deleteAccount } from "wasp/client/operations";
import { logout } from "wasp/client/auth";
import type { User } from "wasp/entities";
import { AlertTriangle, Mail, User as UserIcon } from "lucide-react";
import { useToast } from "../client/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../client/components/ui/dialog";

export default function AccountPage({ user }: { user: User }) {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">
        Account
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Manage your account settings
      </p>

      {/* Account Info */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#111114]">
        <div className="border-b border-white/[0.07] px-6 py-4">
          <h2 className="text-sm font-semibold text-white">
            Account Information
          </h2>
        </div>
        <div className="divide-y divide-white/[0.07]">
          {user.email && (
            <div className="flex items-center gap-3 px-6 py-4">
              <Mail className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm text-white">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          {user.username && (
            <div className="flex items-center gap-3 px-6 py-4">
              <UserIcon className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Username</p>
                <p className="text-sm text-white">
                  {user.username}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mt-8 rounded-2xl border border-red-500/20 bg-[#111114]">
        <div className="border-b border-red-500/20 px-6 py-4">
          <h2 className="text-sm font-semibold text-red-400">
            Danger Zone
          </h2>
        </div>
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-white">
              Delete account
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}

function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logout();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
      >
        Delete account
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all your data
              including projects, API keys, and usage history. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-lg border border-white/[0.07] bg-[#18181c] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-red-400 focus:ring-1 focus:ring-red-400"
              autoFocus
            />
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setOpen(false);
                setConfirmText("");
              }}
              className="rounded-lg border border-white/[0.07] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || isDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete my account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

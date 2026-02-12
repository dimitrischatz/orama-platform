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
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Account
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Manage your account settings
      </p>

      {/* Account Info */}
      <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Account Information
          </h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
          {user.email && (
            <div className="flex items-center gap-3 px-6 py-4">
              <Mail className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm text-zinc-900 dark:text-white">
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
                <p className="text-sm text-zinc-900 dark:text-white">
                  {user.username}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mt-8 rounded-2xl border border-red-200 bg-white dark:border-red-500/20 dark:bg-zinc-800/50">
        <div className="border-b border-red-200 px-6 py-4 dark:border-red-500/20">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Danger Zone
          </h2>
        </div>
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
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
        className="shrink-0 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
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
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
              autoFocus
            />
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setOpen(false);
                setConfirmText("");
              }}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
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

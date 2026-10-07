"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/services";

const CONFIRM_WORD = "OCHIRISH";

export function DeleteAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = confirmText === CONFIRM_WORD && password.length > 0;

  const reset = () => {
    setPassword("");
    setConfirmText("");
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleDelete = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAccount(password);
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Hisobni o'chirish">
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-900">⚠️ Diqqat!</p>
          <p className="mt-1 text-sm text-rose-700">
            Hisobingiz va barcha ma&apos;lumotlaringiz (vakansiyalar, rezyumelar,
            arizalar) <strong>butunlay o&apos;chiriladi</strong>. Bu amalni
            qaytarib bo&apos;lmaydi.
          </p>
        </div>

        <Input
          label="Parolingizni kiriting"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parol"
          autoComplete="current-password"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tasdiqlash uchun{" "}
            <span className="font-mono font-bold text-rose-600">
              {CONFIRM_WORD}
            </span>{" "}
            deb yozing
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            disabled={!canSubmit}
          >
            Hisobni butunlay o&apos;chirish
          </Button>
        </div>
      </div>
    </Modal>
  );
}

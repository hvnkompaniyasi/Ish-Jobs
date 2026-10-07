"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import {
  applicationsService,
  resumesService,
  getErrorMessage,
} from "@/services";
import { cn } from "@/lib/utils";
import type { Job, Resume } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  job: Job;
}

export function ApplyModal({ open, onClose, job }: Props) {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingResumes(true);
    setError(null);
    setDone(false);
    (async () => {
      try {
        const data = await resumesService.getMyResumes();
        setResumes(data);
        const primary = data.find((r) => r.isPrimary);
        setSelectedResumeId(primary?._id || data[0]?._id || "");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingResumes(false);
      }
    })();
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedResumeId) {
      setError("Rezyume tanlanishi shart");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await applicationsService.apply({
        jobId: job._id,
        resumeId: selectedResumeId,
        coverLetter: coverLetter.trim() || undefined,
      });
      setDone(true);
      setTimeout(() => {
        onClose();
        router.push("/applications/my");
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Ariza topshirish" size="lg">
      {done ? (
        <div className="py-6 text-center">
          <div className="text-5xl">🎉</div>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            Ariza yuborildi!
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Arizalar bo&apos;limiga yo&apos;naltirilmoqda...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Vakansiya</p>
            <p className="text-sm font-semibold text-slate-900">{job.title}</p>
            <p className="text-xs text-slate-500">
              {job.company?.name} •{" "}
              {job.location?.isRemote ? "Masofadan" : job.location?.city}
            </p>
          </div>

          {loadingResumes ? (
            <div className="flex justify-center py-6">
              <Spinner className="h-6 w-6" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm text-amber-900">
                Ariza topshirish uchun avval rezyume yaratishingiz kerak
              </p>
              <Link href="/resumes/create" onClick={onClose}>
                <Button className="mt-3">Rezyume yaratish</Button>
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Rezyume tanlang *
                </label>
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => setSelectedResumeId(r._id)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition",
                        selectedResumeId === r._id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border-2",
                            selectedResumeId === r._id
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-slate-300"
                          )}
                        >
                          {selectedResumeId === r._id && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {r.title}
                          </p>
                          {r.isPrimary && (
                            <p className="text-[10px] font-semibold uppercase text-amber-600">
                              Asosiy
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Qisqa xat (ixtiyoriy)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  maxLength={3000}
                  placeholder="Nega aynan siz bu lavozimga mos kelasiz?"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {coverLetter.length}/3000
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm whitespace-pre-line text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onClose} disabled={submitting}>
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={!selectedResumeId}
                >
                  Arizani yuborish
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

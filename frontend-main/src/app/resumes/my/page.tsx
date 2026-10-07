"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks";
import { resumesService, getErrorMessage } from "@/services";
import { formatSalary, timeAgo } from "@/lib/utils";
import type { Resume } from "@/types";

export default function MyResumesPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/resumes/my");
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await resumesService.getMyResumes();
        setResumes(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, isAuthenticated, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Rezyumeni o'chirishni tasdiqlaysizmi?")) return;
    setDeleting(id);
    try {
      await resumesService.deleteResume(id);
      setResumes((list) => list.filter((r) => r._id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Mening rezyumelarim
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {resumes.length} ta rezyume
          </p>
        </div>
        <Link href="/resumes/create">
          <Button className="rounded-xl">+ Yangi</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && !loading && (
        <div className="rim rounded-3xl glass p-6 text-center text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {!loading && !error && resumes.length === 0 && (
        <div className="rim rounded-3xl glass p-12 text-center">
          <div className="text-4xl">📄</div>
          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
            Hozircha rezyume yo&apos;q
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Birinchi rezyumeni yarating va ish beruvchilarga ko&apos;rsating
          </p>
          <Link href="/resumes/create">
            <Button className="mt-4 rounded-xl">Rezyume yaratish</Button>
          </Link>
        </div>
      )}

      {!loading && !error && resumes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {resumes.map((r) => (
            <div
              key={r._id}
              className="rim rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {r.isPrimary && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        Asosiy
                      </span>
                    )}
                    {r.isPublic === false && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-zinc-400">
                        Yopiq
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 truncate text-lg font-bold text-slate-900 dark:text-white">
                    {r.title}
                  </h3>
                </div>
              </div>
              {r.about && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-zinc-400">
                  {r.about}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.skills?.slice(0, 4).map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-white/10"
                  >
                    {s}
                  </span>
                ))}
                {(r.skills?.length || 0) > 4 && (
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    +{(r.skills?.length || 0) - 4}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-white/5">
                <span className="text-sm font-bold text-slate-900 dark:text-emerald-400">
                  {formatSalary(r.expectedSalary)}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  {timeAgo(r.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/resumes/${r._id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Ko&apos;rish
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleting === r._id}
                  onClick={() => handleDelete(r._id)}
                >
                  O&apos;chirish
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

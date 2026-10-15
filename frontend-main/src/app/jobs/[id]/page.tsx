import type { Metadata } from "next";
import { JobDetailClient } from "./JobDetailClient";
import { formatSalary } from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = "https://ish-jobs.vercel.app";

interface JobMeta {
  title?: string;
  company?: { name?: string; logo?: string | null } | string;
  salary?: unknown;
  location?: { city?: string };
  employmentType?: string;
}

async function fetchJobMeta(id: string): Promise<JobMeta | null> {
  try {
    const res = await fetch(`${API_URL}/jobs/${id}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? body) as JobMeta;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJobMeta(id);

  if (!job || !job.title) {
    return {
      title: "Vakansiya topilmadi | IshJobs",
      description: "IshJobs — O'zbekistondagi eng qulay ish qidirish platformasi.",
    };
  }

  const companyName =
    typeof job.company === "object" && job.company !== null
      ? job.company.name || "Kompaniya"
      : (job.company as string) || "Kompaniya";

  const salary = formatSalary(job.salary as never);
  const city = job.location?.city || "O'zbekiston";
  const employment = job.employmentType
    ? job.employmentType.charAt(0).toUpperCase() + job.employmentType.slice(1)
    : "";

  const title = `${job.title} — ${companyName} | IshJobs`;
  const description = `${salary} · ${city}${employment ? ` · ${employment}` : ""}. IshJobs orqali batafsil ko'ring va ariza topshiring.`;
  const url = `${SITE_URL}/jobs/${id}`;
  const logo =
    typeof job.company === "object" && job.company?.logo
      ? job.company.logo
      : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "IshJobs",
      type: "website",
      locale: "uz_UZ",
      ...(logo ? { images: [{ url: logo, width: 400, height: 400, alt: companyName }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(logo ? { images: [logo] } : {}),
    },
  };
}

export default function JobDetailPage() {
  return <JobDetailClient />;
}

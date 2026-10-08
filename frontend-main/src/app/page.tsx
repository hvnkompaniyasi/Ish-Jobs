"use client";

import { useAuth } from "@/hooks";
import { HomeSeeker } from "@/components/home/HomeSeeker";
import { HomeEmployer } from "@/components/home/HomeEmployer";
import { Spinner } from "@/components/ui/Spinner";

export default function HomePage() {
  const { user, hydrated, isAuthenticated } = useAuth();

  // Hydration kutish
  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Tizimga kirmagan yoki seeker — Vakansiyalar
  const isEmployer =
    isAuthenticated &&
    (user?.activeRole === "employer" || user?.role === "employer");

  if (isEmployer) {
    return <HomeEmployer />;
  }

  return <HomeSeeker />;
}

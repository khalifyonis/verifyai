"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CompanyPartnerPortal } from "@/components/CompanyPartnerPortal";

export default function CompanyPage() {
  const router = useRouter();

  const handleSwitch = (portal: "public" | "admin" | "company") => {
    if (portal === "public") router.push("/");
    if (portal === "admin") router.push("/admin");
  };

  return <CompanyPartnerPortal onSwitchPortal={handleSwitch} />;
}

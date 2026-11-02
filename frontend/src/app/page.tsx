"use client";

import React, { useState } from "react";
import { PublicUserPortal } from "@/components/PublicUserPortal";
import { AdminDashboard } from "@/components/AdminDashboard";
import { CompanyPartnerPortal } from "@/components/CompanyPartnerPortal";

export default function Home() {
  const [currentPortal, setCurrentPortal] = useState<"public" | "admin" | "company">("public");

  if (currentPortal === "admin") {
    return <AdminDashboard onSwitchPortal={setCurrentPortal} />;
  }

  if (currentPortal === "company") {
    return <CompanyPartnerPortal onSwitchPortal={setCurrentPortal} />;
  }

  return <PublicUserPortal onSwitchPortal={setCurrentPortal} />;
}

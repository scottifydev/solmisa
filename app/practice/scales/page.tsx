import type { Metadata } from "next";
import { ScalesDrillClient } from "./client";

export const metadata: Metadata = { title: "Scales & Modes · Practice" };

export default function ScalesPage() {
  return <ScalesDrillClient />;
}

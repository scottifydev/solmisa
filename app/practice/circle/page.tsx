import type { Metadata } from "next";
import { CircleDrillClient } from "./client";

export const metadata: Metadata = { title: "Circle of Fifths · Practice" };

export default function CirclePage() {
  return <CircleDrillClient />;
}

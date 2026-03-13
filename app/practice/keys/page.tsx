import type { Metadata } from "next";
import { KeysDrillClient } from "./client";

export const metadata: Metadata = { title: "Key Signatures · Practice" };

export default function KeysPage() {
  return <KeysDrillClient />;
}

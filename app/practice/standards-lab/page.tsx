import type { Metadata } from "next";
import { StandardsLabClient } from "./client";

export const metadata: Metadata = {
  title: "Standards Lab",
  description:
    "Analyze jazz standards — melody, harmony, and scale-degree relationships.",
};

export default function StandardsLabPage() {
  return <StandardsLabClient />;
}

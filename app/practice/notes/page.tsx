import type { Metadata } from "next";
import { NotesDrillClient } from "./client";

export const metadata: Metadata = { title: "Note Reading · Practice" };

export default function NotesPage() {
  return <NotesDrillClient />;
}

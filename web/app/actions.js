"use server";

import { refresh } from "next/cache";
import { apiUrl } from "@/lib/api";

export async function addNote(formData) {
  const text = formData.get("text");

  await fetch(apiUrl("/notes"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  refresh();
}

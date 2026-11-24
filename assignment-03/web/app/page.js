import { Suspense } from "react";
import { connection } from "next/server";
import { apiUrl } from "@/lib/api";
import { addNote } from "./actions";

async function Dashboard() {
  // Opt into request-time rendering so API_URL is read at runtime, not build time.
  await connection();

  let visits, notes;
  try {
    const [visitsRes, notesRes] = await Promise.all([
      fetch(apiUrl("/visits")),
      fetch(apiUrl("/notes")),
    ]);
    ({ visits } = await visitsRes.json());
    notes = await notesRes.json();
  } catch (err) {
    return (
      <p className="error">
        Could not reach the API at {apiUrl("")}: {err.message}
      </p>
    );
  }

  return (
    <>
      <p>
        Visits (Redis): <strong>{visits}</strong>
      </p>

      <h2>Notes (PostgreSQL)</h2>
      <form action={addNote}>
        <input name="text" placeholder="Write a note" required />
        <button type="submit">Add</button>
      </form>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </>
  );
}

export default function Page() {
  return (
    <main>
      <h1>Docker Assignment 03</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

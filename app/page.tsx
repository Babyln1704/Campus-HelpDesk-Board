
"use client";

import { useEffect, useState } from "react";

interface HelpRequest {
  id: number;
  student_name: string;
  message: string;
  created_at: string;
}

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [source, setSource] = useState("");
  const [views, setViews] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    const response = await fetch("/api/requests");
    const data = await response.json();

    if (response.ok) {
      setRequests(data.requests);
      setSource(data.source);
    }
  }

  async function loadViews() {
    const response = await fetch("/api/views");
    const data = await response.json();

    if (response.ok) setViews(data.views);
  }

  useEffect(() => {
    loadRequests().catch(console.error);
    loadViews().catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: name,
          message: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setName("");
      setMessage("");

      await loadRequests();
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900">
            Campus Help Desk
          </h1>
          <p className="mt-2 text-slate-600">
            Ask questions. Help your campus community.
          </p>
          <p className="mt-4 font-semibold">
            Board views: {views}
          </p>
        </header>

        <section className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Post a Help Request</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full rounded-lg border p-3"
              placeholder="Your student name"
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              className="w-full rounded-lg border p-3"
              placeholder="Enter your help request"
              value={message}
              maxLength={200}
              rows={3}
              onChange={(e) => setMessage(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Request"}
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Latest Help Requests</h2>

            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
              source === "Redis"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              Source: {source || "Loading..."}
            </span>
          </div>

          {requests.length === 0 ? (
            <p className="text-slate-500">
              No help requests yet. Be the first to post!
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <h3 className="font-bold text-blue-900">
                    {item.student_name}
                  </h3>

                  <p className="mt-2">{item.message}</p>

                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

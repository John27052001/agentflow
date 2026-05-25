"use client";

import { useEffect, useState } from "react";

type Workflow = {
  id: string;
  input: string;
  summary: string;
  actions: string[];
  createdAt: string;
};

const modes = [
  { value: "meeting", label: "Meeting Notes", icon: "📝" },
  { value: "customer", label: "Customer Feedback", icon: "💬" },
  { value: "bug", label: "Bug Report", icon: "🐞" },
  { value: "standup", label: "Daily Standup", icon: "⚡" },
];

export default function WorkflowPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("meeting");
  const [summary, setSummary] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [history, setHistory] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("agentflow-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function saveHistory(items: Workflow[]) {
    setHistory(items);
    localStorage.setItem("agentflow-history", JSON.stringify(items));
  }

  async function handleGenerate() {
    if (!input.trim()) {
      setError("Please enter some text first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSummary("");
      setActions([]);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      const newWorkflow: Workflow = {
        id: crypto.randomUUID(),
        input,
        summary: data.summary || "No summary returned.",
        actions: Array.isArray(data.actions) ? data.actions : [],
        createdAt: new Date().toLocaleString(),
      };

      setSummary(newWorkflow.summary);
      setActions(newWorkflow.actions);
      saveHistory([newWorkflow, ...history]);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function loadWorkflow(workflow: Workflow) {
    setInput(workflow.input);
    setSummary(workflow.summary);
    setActions(workflow.actions);
  }

  function clearHistory() {
    saveHistory([]);
  }

  function deleteWorkflow(id: string) {
    saveHistory(history.filter((item) => item.id !== id));
  }

  function startNewWorkflow() {
    setInput("");
    setSummary("");
    setActions([]);
    setError("");
  }

  async function copySummary() {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    alert("Summary copied!");
  }

  async function copyActions() {
    if (actions.length === 0) return;
    await navigator.clipboard.writeText(actions.join("\n"));
    alert("Action items copied!");
  }

  const currentMode = modes.find((item) => item.value === mode);

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] px-6 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute right-[-10%] top-[20%] h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur md:flex-row md:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1 text-sm text-blue-200">
              AgentFlow · AI Workflow Automation
            </p>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Turn messy notes into clear workflows.
            </h1>

            <p className="mt-4 max-w-2xl text-slate-300">
              Summarize meetings, feedback, standups, and bug reports into
              organized decisions and action items.
            </p>
          </div>

          <button
            onClick={startNewWorkflow}
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            + New Workflow
          </button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {modes.map((item) => (
            <button
              key={item.value}
              onClick={() => setMode(item.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                mode === item.value
                  ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/10"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
              }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <p className="mt-3 font-semibold">{item.label}</p>
              <p className="mt-1 text-sm text-slate-400">
                Generate focused workflow output.
              </p>
            </button>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Workflow Input</h2>
                <p className="text-sm text-slate-400">
                  Current mode: {currentMode?.icon} {currentMode?.label}
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">
                {input.length} chars
              </span>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste meeting notes, customer feedback, bug reports, or standup updates..."
              className="h-72 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />

            {error && (
              <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating workflow..." : "Generate AI Workflow"}
            </button>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">History</h2>
                <p className="text-sm text-slate-400">
                  {history.length} saved workflows
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-5 max-h-[430px] space-y-3 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-400">
                  No workflows yet. Generate one to save it here.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-blue-400/70"
                  >
                    <button
                      onClick={() => loadWorkflow(item)}
                      className="w-full text-left"
                    >
                      <p className="line-clamp-3 text-sm text-slate-300">
                        {item.summary}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        {item.createdAt}
                      </p>
                    </button>

                    <button
                      onClick={() => deleteWorkflow(item.id)}
                      className="mt-3 text-xs text-red-300 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">AI Output</h2>
              <p className="text-sm text-slate-400">
                Structured summary and next steps appear below.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-blue-200">Summary</h3>

                {summary && (
                  <button
                    onClick={copySummary}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
                  >
                    Copy
                  </button>
                )}
              </div>

              <p className="mt-4 min-h-24 whitespace-pre-line text-slate-200">
                {summary || "Your generated summary will appear here."}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-emerald-200">
                  Action Items
                </h3>

                {actions.length > 0 && (
                  <button
                    onClick={copyActions}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
                  >
                    Copy
                  </button>
                )}
              </div>

              {actions.length > 0 ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-200">
                  {actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 min-h-24 text-slate-200">
                  Your generated action items will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
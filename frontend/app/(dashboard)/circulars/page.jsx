"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/auth-storage";

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CircularsPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      router.push("/login");
      return;
    }
    setSession(activeSession);
    fetchCirculars();
  }, []);

  async function fetchCirculars() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/circulars");
      if (res.success && res.data) {
        setCirculars(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load circulars.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!title.trim()) {
      setUploadError("Please provide a title for the circular.");
      return;
    }
    if (!file) {
      setUploadError("Please select a PDF document to upload.");
      return;
    }
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF documents are allowed.");
      return;
    }

    setUploading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
      const sessionRaw = localStorage.getItem("hrms_session");
      const authHeader = sessionRaw ? JSON.parse(sessionRaw)?.authHeader : null;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("file", file);

      const headers = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const res = await fetch(`${API_BASE_URL}/circulars`, {
        method: "POST",
        headers,
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setUploadSuccess("Circular published and uploaded successfully!");
        setTitle("");
        setDescription("");
        setFile(null);
        // Reset file input element if present
        const fileInput = document.getElementById("circular-file-input");
        if (fileInput) fileInput.value = "";
        
        fetchCirculars();
      } else {
        setUploadError(json.message || "Failed to upload circular.");
      }
    } catch (err) {
      setUploadError(err.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(id, originalName) {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
      const sessionRaw = localStorage.getItem("hrms_session");
      const authHeader = sessionRaw ? JSON.parse(sessionRaw)?.authHeader : null;

      const headers = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const res = await fetch(`${API_BASE_URL}/circulars/${id}/download`, { headers });
      if (!res.ok) {
        throw new Error("Failed to stream download resource.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to remove this circular? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await apiFetch(`/circulars/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchCirculars();
      }
    } catch (err) {
      alert("Failed to delete circular: " + err.message);
    }
  }

  const isHrAdmin = session?.role === "HR_ADMIN";

  if (loading && circulars.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Circular Board</h1>
        <p className="mt-1 text-sm text-slate-500">
          Access the latest policy guidelines, notices, and internal publications.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Grid layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Form Card on Left (HR Admin Only) */}
        {isHrAdmin && (
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Publish Circular</h2>
            
            {uploadError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-250 p-3 text-xs text-emerald-700 font-medium">
                {uploadSuccess}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4" id="circular-upload-form">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Holiday List 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  placeholder="Provide brief details about this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-indigo-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">PDF Document *</label>
                <input
                  id="circular-file-input"
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl py-2.5 shadow-sm active:scale-95 transition-all disabled:bg-indigo-400"
              >
                {uploading ? "Publishing..." : "Upload & Publish"}
              </button>
            </form>
          </div>
        )}

        {/* Circulars Directory List on Right */}
        <div className={isHrAdmin ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Published Notices</h2>
          
          {circulars.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 italic text-sm">
              No circular documents have been published on the board yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {circulars.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Header: PDF Icon & Date */}
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        📄
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {fmtDate(c.uploadedAt)}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {c.title}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {c.description}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 truncate font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md w-fit">
                        Attachment: {c.originalName}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDownload(c.id, c.originalName)}
                      className="flex-1 text-xs bg-indigo-50 text-indigo-700 font-bold py-1.5 px-3 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                    >
                      Download PDF
                    </button>
                    {isHrAdmin && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs bg-red-50 text-red-600 font-bold py-1.5 px-3 rounded-xl hover:bg-red-100 transition-colors"
                        title="Delete Notice"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

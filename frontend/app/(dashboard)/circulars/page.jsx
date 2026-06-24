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

function fmtFileSize(bytes) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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
  
  // Drag & drop state
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setUploadError("");
      } else {
        setUploadError("Only PDF documents are allowed.");
      }
    }
  };

  const onUploadBoxClick = () => {
    const fileInput = document.getElementById("circular-file-input");
    if (fileInput) fileInput.click();
  };

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 dark:border-violet-900/30 border-t-violet-600 dark:border-t-violet-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 tracking-tight">
          Circular Board
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Access the latest policy guidelines, official notices, and internal publications.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 text-sm text-red-700 dark:text-red-400 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Form Card on Left (HR Admin Only) */}
        {isHrAdmin && (
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none h-fit space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Publish Circular
            </h2>
            
            {uploadError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3.5 text-xs text-red-700 dark:text-red-400 font-semibold leading-relaxed">
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-3.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed">
                {uploadSuccess}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4" id="circular-upload-form">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Holiday List 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Provide brief details about this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none resize-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                  PDF Document *
                </label>
                
                {/* Hidden browser input */}
                <input
                  id="circular-file-input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                      setUploadError("");
                    }
                  }}
                  className="hidden"
                />

                {/* Custom drag-and-drop container */}
                {file ? (
                  <div className="flex items-center gap-3 p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/60 dark:border-violet-900/30 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {fmtFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        const fileInput = document.getElementById("circular-file-input");
                        if (fileInput) fileInput.value = "";
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors duration-150"
                      title="Remove document"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={onUploadBoxClick}
                    className={[
                      "group border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5",
                      dragActive
                        ? "border-violet-500 bg-violet-50/30 dark:bg-violet-950/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-900 bg-slate-50/50 dark:bg-slate-950/20",
                    ].join(" ")}
                  >
                    <svg className="h-10 w-10 text-slate-400 dark:text-slate-600 transition-colors duration-250 group-hover:text-violet-500 dark:group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                        Drag & drop your PDF file
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        or click to browse local files
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 font-bold text-white rounded-xl py-2.5 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Upload & Publish</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Circulars Directory List on Right */}
        <div className={isHrAdmin ? "lg:col-span-2 space-y-5" : "lg:col-span-3 space-y-5"}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Published Notices
          </h2>
          
          {circulars.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 italic text-sm">
              No circular documents have been published on the board yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">
              {circulars.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/85 rounded-2xl p-5 shadow-sm dark:shadow-none flex flex-col justify-between hover:shadow-md dark:hover:border-slate-700 hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-0.5 group"
                >
                  <div className="space-y-3.5">
                    {/* Header: SVG Doc Icon & Date */}
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 bg-red-50 dark:bg-red-950/20 border border-red-100/60 dark:border-red-900/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800/60">
                        {fmtDate(c.uploadedAt)}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {c.title}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {c.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 truncate font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 px-2.5 py-1 rounded-lg w-fit max-w-full">
                        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32a1.5 1.5 0 0 1-2.12-2.121L14.071 9.75" />
                        </svg>
                        <span className="truncate">{c.originalName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={() => handleDownload(c.id, c.originalName)}
                      className="flex-1 text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 font-semibold py-2 px-3 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span>Download PDF</span>
                    </button>
                    {isHrAdmin && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 font-semibold py-2 px-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/30 transition-all duration-200 flex items-center justify-center gap-1.5"
                        title="Delete Notice"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        <span>Delete</span>
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

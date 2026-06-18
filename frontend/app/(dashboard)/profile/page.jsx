"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { getSession, updateSession } from "@/lib/auth-storage";

function ProfileContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [savingDetails, setSavingDetails] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form states
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bio, setBio] = useState("");

  const fileInputRef = useRef(null);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");
      
      const session = getSession();
      const currentEmployeeId = session?.employeeId;
      const targetOwn = !employeeId || employeeId === currentEmployeeId;
      
      setIsOwnProfile(targetOwn);
      setIsEditing(false);

      const endpoint = targetOwn ? "/employees/profile" : `/employees/${employeeId}`;
      const response = await apiFetch(endpoint);

      if (response.success && response.data) {
        const data = response.data;
        setProfile(data);
        setAddress(data.address || "");
        setPhoneNumber(data.phoneNumber || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setBio(data.bio || "");
      } else {
        setError(response.message || "Failed to load profile details.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while fetching profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [employeeId]);

  async function handleSaveDetails(e) {
    e.preventDefault();
    setSavingDetails(true);
    setSuccessMsg("");
    setError("");

    try {
      const response = await apiFetch("/employees/profile", {
        method: "PUT",
        body: JSON.stringify({
          address,
          phoneNumber,
          linkedinUrl,
          bio,
        }),
      });

      if (response.success && response.data) {
        setProfile(response.data);
        setSuccessMsg("Profile details updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError(response.message || "Failed to update profile details.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not update profile details.");
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleAvatarChange(e) {
    if (!isOwnProfile || !isEditing) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image must be smaller than 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setUploadingAvatar(true);
    setError("");
    setSuccessMsg("");

    try {
      const session = getSession();
      if (!session) {
        throw new Error("No active session found.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/employees/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: session.authHeader,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newProfilePic = data.data;
        updateSession({ profilePic: newProfilePic });
        setProfile((prev) => ({ ...prev, profilePic: newProfilePic }));
        setSuccessMsg("Profile avatar updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError(data.message || "Failed to upload avatar.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error occurred during avatar upload.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  const triggerFileInput = () => {
    if (isOwnProfile && isEditing) {
      fileInputRef.current?.click();
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-violet-100 dark:border-violet-900/30 border-t-violet-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching profile details...</p>
        </div>
      </div>
    );
  }

  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {isOwnProfile ? "Your Profile" : `${profile?.fullName}'s Profile`}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isOwnProfile 
              ? "View and manage your personal public details, bio, and custom avatar."
              : "Read-only corporate and public information for this workspace member."}
          </p>
        </div>

        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm h-fit transition-colors duration-200">
          <div 
            className={[
              "relative group",
              isOwnProfile && isEditing ? "cursor-pointer" : "cursor-default"
            ].join(" ")}
            onClick={triggerFileInput}
          >
            {isOwnProfile && isEditing && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            )}
            {profile?.profilePic ? (
              <img
                src={`${API_BASE_URL}/employees/profile/avatar/${profile.profilePic}`}
                alt={profile.fullName}
                className={[
                  "h-28 w-28 rounded-full object-cover border-4 border-violet-50 dark:border-violet-950 shadow-md transition-all duration-200",
                  isOwnProfile && isEditing ? "group-hover:border-violet-100 dark:group-hover:border-slate-800 group-hover:opacity-90" : ""
                ].join(" ")}
              />
            ) : (
              <div 
                className={[
                  "h-28 w-28 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-violet-50 dark:border-violet-950 shadow-md transition-all duration-200",
                  isOwnProfile && isEditing ? "group-hover:from-violet-600 group-hover:to-indigo-700" : ""
                ].join(" ")}
              >
                {initials}
              </div>
            )}

            {/* Hover overlay (Only in edit mode) */}
            {isOwnProfile && isEditing && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Change Photo
              </div>
            )}

            {/* Upload spinner */}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-4">{profile?.fullName}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{profile?.email}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider">
            {profile?.designation}
          </div>

          {/* Social LinkedIn Link Display */}
          {profile?.linkedinUrl && !isEditing && (
            <a
              href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              LinkedIn Profile
            </a>
          )}
        </div>

        {/* Right Column - Detail lists / edit form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-5">
              Contact & Social Details
            </h3>

            {isEditing ? (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/60 focus:bg-white focus:dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-650 text-sm text-slate-700 dark:text-slate-200 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/60 focus:bg-white focus:dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-650 text-sm text-slate-700 dark:text-slate-200 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Bio Section
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us a little bit about yourself, interests or focus areas..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/60 focus:bg-white focus:dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-650 text-sm text-slate-700 dark:text-slate-200 font-medium transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Residential Address
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter your current residential address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/60 focus:bg-white focus:dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-650 text-sm text-slate-700 dark:text-slate-200 font-medium transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setAddress(profile?.address || "");
                      setPhoneNumber(profile?.phoneNumber || "");
                      setLinkedinUrl(profile?.linkedinUrl || "");
                      setBio(profile?.bio || "");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingDetails}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {savingDetails && (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    Save Details
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bio Description</p>
                  <p className="text-sm text-slate-650 dark:text-slate-350 mt-1.5 leading-relaxed bg-slate-50/50 dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40 italic">
                    {profile?.bio || "No bio description provided yet."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{profile?.phoneNumber || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">LinkedIn URL</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate max-w-xs">
                      {profile?.linkedinUrl ? (
                        <a
                          href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 dark:text-violet-400 hover:underline hover:text-violet-700"
                        >
                          {profile.linkedinUrl}
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{profile?.address || "Not set"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Read-only corporate details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-5">Job Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{profile?.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Designation</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{profile?.designation}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Joined Date</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {profile?.joiningDate
                    ? new Date(profile.joiningDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Employment Status</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 uppercase">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-violet-100 dark:border-violet-900/30 border-t-violet-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

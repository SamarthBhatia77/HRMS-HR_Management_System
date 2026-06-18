"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/auth-storage";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
}

function fmtTime(timeStr) {
  if (!timeStr) return "—";
  try {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AttendancePage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: success, error

  // Calendar filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // HR Location Edit State
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [editRadius, setEditRadius] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    setSession(getSession());
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (officeLocation && userCoords) {
      const dist = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );
      setDistance(dist);
    }
  }, [officeLocation, userCoords]);

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth, selectedYear]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      // 1. Fetch Office Location
      const locRes = await apiFetch("/attendance/location");
      if (locRes.success && locRes.data) {
        setOfficeLocation(locRes.data);
        setEditLat(locRes.data.latitude.toString());
        setEditLng(locRes.data.longitude.toString());
        setEditRadius(locRes.data.radiusMeters.toString());
        setEditAddress(locRes.data.address || "");
      }

      // 2. Fetch Today's Record
      const todayRes = await apiFetch("/attendance/today");
      if (todayRes.success && todayRes.data) {
        setTodayRecord(todayRes.data);
      }

      // 3. Request User Geolocation
      requestUserLocation();

      // 4. Fetch History
      await fetchHistory();
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setLoading(false);
    }
  }

  function requestUserLocation() {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          console.error("Geolocation error", error);
          setLocationError("Please enable browser location access to scan and mark attendance.");
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }

  async function fetchHistory() {
    try {
      const res = await apiFetch(`/attendance/history?month=${selectedMonth}&year=${selectedYear}`);
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }

  async function handleMarkAttendance() {
    if (!userCoords) {
      setMessage({ text: "Unable to detect your location. Please check settings.", type: "error" });
      requestUserLocation();
      return;
    }

    setMarking(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await apiFetch("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
        }),
      });

      if (res.success && res.data) {
        setTodayRecord(res.data);
        setMessage({
          text: res.data.checkOut 
            ? "Successfully checked out for today! Have a great evening." 
            : "Successfully checked in! Have a productive day.",
          type: "success",
        });
        fetchHistory();
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to mark attendance.", type: "error" });
    } finally {
      setMarking(false);
    }
  }

  async function handleUpdateLocation(e) {
    e.preventDefault();
    setUpdatingLocation(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await apiFetch("/attendance/location", {
        method: "PUT",
        body: JSON.stringify({
          latitude: parseFloat(editLat),
          longitude: parseFloat(editLng),
          radiusMeters: parseFloat(editRadius),
          address: editAddress,
        }),
      });

      if (res.success && res.data) {
        setOfficeLocation(res.data);
        setMessage({ text: "Office geofencing coordinates updated successfully.", type: "success" });
        requestUserLocation(); // trigger range recalculation
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to update office location.", type: "error" });
    } finally {
      setUpdatingLocation(false);
    }
  }

  const isHrAdmin = session?.role === "HR_ADMIN";
  const inRange = officeLocation && distance !== null && distance <= officeLocation.radiusMeters;
  const isCheckIn = !todayRecord;
  const isCheckOut = todayRecord && !todayRecord.checkOut;
  const isCompleted = todayRecord && todayRecord.checkOut;

  // Determine button state color, label & disabled status
  let buttonBg = "bg-slate-300 cursor-not-allowed text-slate-500 border-slate-350";
  let buttonLabel = "Scan Range";
  let statusMessage = "Checking your location range...";
  let pulseAnimation = "";

  if (locationError) {
    statusMessage = locationError;
    buttonLabel = "Out of range";
  } else if (officeLocation && distance !== null) {
    if (isCheckIn) {
      if (inRange) {
        buttonBg = "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 border-emerald-450 hover:scale-105 active:scale-95 cursor-pointer";
        buttonLabel = "Check In";
        statusMessage = "In range. Please mark your attendance.";
        pulseAnimation = "animate-ping absolute inset-0 rounded-full bg-emerald-500 opacity-20 scale-110";
      } else {
        buttonBg = "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-500 border border-rose-250 cursor-not-allowed";
        buttonLabel = "Out of range";
        statusMessage = `Out of range! You are ${Math.round(distance)}m away from the office.`;
      }
    } else if (isCheckOut) {
      if (inRange) {
        buttonBg = "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200 border-amber-450 hover:scale-105 active:scale-95 cursor-pointer";
        buttonLabel = "Check Out";
        statusMessage = "In range. Tap to check out.";
        pulseAnimation = "animate-ping absolute inset-0 rounded-full bg-amber-500 opacity-20 scale-110";
      } else {
        buttonBg = "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-500 border border-rose-250 cursor-not-allowed";
        buttonLabel = "Out of range";
        statusMessage = `Out of range! You are ${Math.round(distance)}m away from the office.`;
      }
    } else if (isCompleted) {
      buttonBg = "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed";
      buttonLabel = "Completed";
      statusMessage = "You have checked out for the day.";
    }
  }

  if (loading) {
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
        <h1 className="text-2xl font-bold text-slate-900">Attendance Portal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mark your check-in and check-out attendance and browse your monthly records.
        </p>
      </div>

      {message.text && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {message.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            )}
          </svg>
          <span className="whitespace-pre-line">{message.text}</span>
        </div>
      )}

      {/* Main Grid: Attendance Circle on Left, Details & Settings on Right */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Attendance Circle Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Time Clock</h2>

          {/* Range Status Bar */}
          <div className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
            inRange 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : "bg-rose-50 text-rose-700 border-rose-100"
          }`}>
            {inRange ? "● In Geofence Range" : "○ Out of Range"}
          </div>

          {/* Circular Button Wrapper */}
          <div className="relative h-44 w-44 flex items-center justify-center">
            {pulseAnimation && <span className={pulseAnimation} />}
            <button
              id="attendance-clock-btn"
              disabled={marking || isCompleted || (!inRange && !locationError)}
              onClick={handleMarkAttendance}
              className={`${buttonBg} relative h-40 w-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 select-none font-bold border-4 text-center focus:outline-none`}
            >
              {marking ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <span className="text-xl uppercase tracking-wide">{buttonLabel}</span>
                  {!isCompleted && inRange && (
                    <span className="text-[10px] mt-1 opacity-70 font-normal">Tap to confirm</span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] mt-1 opacity-70 font-normal">Check out completed</span>
                  )}
                </>
              )}
            </button>
          </div>

          <p className={`text-xs font-semibold ${inRange ? "text-emerald-600" : "text-rose-500"}`}>
            {statusMessage}
          </p>

          <button 
            onClick={requestUserLocation} 
            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 mt-1 hover:underline"
          >
            Refresh Location
          </button>
        </div>

        {/* Today's Times & Details Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Today's Attendance Status</h2>
            
            {/* Times Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs font-medium text-slate-400">Check In</span>
                <span className="text-xl font-bold text-slate-700 mt-1">
                  {todayRecord ? fmtTime(todayRecord.checkIn) : "—"}
                </span>
                {todayRecord && todayRecord.late && (
                  <span className="inline-flex self-start mt-2 px-2 py-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-full">
                    Late Comer
                  </span>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs font-medium text-slate-400">Check Out</span>
                <span className="text-xl font-bold text-slate-700 mt-1">
                  {todayRecord ? fmtTime(todayRecord.checkOut) : "—"}
                </span>
                {todayRecord && todayRecord.overtime && (
                  <span className="inline-flex self-start mt-2 px-2 py-0.5 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full">
                    Overtime
                  </span>
                )}
              </div>
            </div>

            {/* Geofence target details */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Target Worksite Geofence</span>
              <div className="grid gap-2 sm:grid-cols-2 text-xs text-indigo-700 mt-1">
                <div>
                  <span className="font-semibold">Address:</span> {officeLocation?.address || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Radius Limit:</span> {officeLocation?.radiusMeters}m
                </div>
                {userCoords && (
                  <div className="sm:col-span-2 text-slate-500 mt-1 border-t border-indigo-100/40 pt-2">
                    <span className="font-semibold text-indigo-700">Detected Coordinates:</span> Lat: {userCoords.latitude.toFixed(6)}, Lng: {userCoords.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            * Daily Check-In opens at any time, but entries after 10:15 AM are marked "Late". Daily Check-Out after 5:45 PM is recorded as "Overtime". All late and overtime exceptions report immediately to your manager.
          </div>
        </div>
      </div>

      {/* HR Admin Coordinates config card */}
      {isHrAdmin && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Office Location Management (HR Admin Only)</h2>
          <form onSubmit={handleUpdateLocation} className="grid gap-4 sm:grid-cols-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Latitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={editLat}
                onChange={(e) => setEditLat(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Longitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={editLng}
                onChange={(e) => setEditLng(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Radius Limit (Meters)</label>
              <input
                type="number"
                step="1"
                required
                value={editRadius}
                onChange={(e) => setEditRadius(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={updatingLocation}
                className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl py-2.5 shadow-sm active:scale-95 transition-all"
              >
                {updatingLocation ? "Saving Settings..." : "Save Config"}
              </button>
            </div>
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-600">Site Location Address / Remarks</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="e.g. Noida Film City Office"
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </form>
        </div>
      )}

      {/* Attendance Log History Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Monthly Attendance History</h2>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic text-sm">
              No attendance logs found for the selected month.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Check In</th>
                    <th className="px-6 py-3.5">Check Out</th>
                    <th className="px-6 py-3.5">Flags</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {history.map((record) => {
                    let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    let statusLabel = "Present";

                    if (record.late && record.overtime) {
                      statusColor = "bg-amber-50 text-amber-800 border-amber-100";
                      statusLabel = "Late + Overtime";
                    } else if (record.late) {
                      statusColor = "bg-rose-50 text-rose-700 border-rose-100";
                      statusLabel = "Late Arrival";
                    } else if (record.overtime) {
                      statusColor = "bg-violet-50 text-violet-700 border-violet-100";
                      statusLabel = "Overtime";
                    }

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                          {fmtDate(record.date)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {fmtTime(record.checkIn)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {fmtTime(record.checkOut)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {record.late && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-700 rounded-full">
                                Late
                              </span>
                            )}
                            {record.overtime && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-50 border border-violet-100 text-violet-700 rounded-full">
                                Overtime
                              </span>
                            )}
                            {!record.late && !record.overtime && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full">
                                On Time
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

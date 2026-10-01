// components/NextSlotModal.js
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "../lib/api";

export default function NextSlotModal({ isOpen, onClose, rooms, defaultDate }) {
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const [date, setDate] = useState(defaultDate);
  const [duration, setDuration] = useState(45);
  const [resultSlot, setResultSlot] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setResultSlot(null);

    try {
      const activeRoomId = roomId || rooms[0]?.id;
      const res = await fetcher("/booking/next-available", {
        method: "POST",
        body: JSON.stringify({ date, duration: Number(duration), roomId: activeRoomId }),
      });
      const slot = res.AvailbleSlot || res.availableSlot || res.slot;
      if (slot && slot.startTime && slot.endTime) {
        setResultSlot(slot);
      } else {
        toast.error(res.message || "No free slot available for this duration.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg max-w-md w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">Find Free Slot</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Target Room</label>
            <select
              value={roomId || rooms[0]?.id}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id} className="bg-zinc-900">
                  {r.name} ({r.capacity} seats)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Duration (Minutes)</label>
            <input
              type="number"
              min="15"
              max="480"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-medium rounded transition disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Find Available Slot"}
          </button>
        </form>

        {/* Slot Result View */}
        {resultSlot && (
          <div className="mt-4 p-3.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-100">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
              Earliest Slot Found
            </p>
            <p className="text-lg font-bold text-zinc-100 font-mono mt-1">
              {resultSlot.startTime} – {resultSlot.endTime}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Duration: <strong className="text-zinc-200">{duration} mins</strong> on {date}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
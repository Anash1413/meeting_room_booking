// components/CreateBookingModal.js
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "../lib/api";

export default function CreateBookingModal({ isOpen, onClose, rooms, onSuccess, defaultDate, defaultRoomId }) {
  const [formData, setFormData] = useState({
    title: "",
    roomId: defaultRoomId || rooms[0]?.id || "",
    date: defaultDate,
    startTime: "09:00",
    endTime: "10:00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        roomId: defaultRoomId || rooms[0]?.id || "",
        date: defaultDate,
        startTime: "09:00",
        endTime: "10:00",
      });
    }
  }, [isOpen, defaultDate, defaultRoomId, rooms]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Please enter a meeting title.");
    }
    if (!formData.roomId) {
      return toast.error("Please select a room.");
    }
    if (formData.startTime >= formData.endTime) {
      return toast.error("End time must be later than start time.");
    }
    if (formData.startTime < "09:00" || formData.endTime > "18:00") {
      return toast.error("Bookings must be between 09:00 and 18:00.");
    }

    setIsSubmitting(true);
    try {
      await fetcher("/booking/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Booking created successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg max-w-md w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">New Booking</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Meeting Title</label>
            <input
              type="text"
              placeholder="e.g. Sprint Planning"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Room</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
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
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-300 font-medium mb-1">Start Time</label>
              <input
                type="time"
                step="900"
                min="09:00"
                max="17:45"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-300 font-medium mb-1">End Time</label>
              <input
                type="time"
                step="900"
                min="09:15"
                max="18:00"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition border border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded transition disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
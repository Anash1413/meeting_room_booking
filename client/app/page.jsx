// app/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Calendar, Clock, DoorClosed, Search } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "./lib/api";
import CreateBookingModal from "./components/CreateBookingModal";
import NextSlotModal from "./components/NextSlotModal";

export default function Dashboard() {
  const today = new Date().toISOString().split("T")[0];

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [preselectedRoomId, setPreselectedRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // 1. Fetch Rooms
  useEffect(() => {
    fetcher("/rooms")
      .then((data) => {
        const roomList = data.rooms || data.data || data;
        if (Array.isArray(roomList)) {
          setRooms(roomList);
        }
      })
      .catch((err) => toast.error(err.message));
  }, []);

  // 2. Fetch Bookings
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedDate) query.append("date", selectedDate);
      if (selectedRoomId) query.append("roomId", selectedRoomId);

      const res = await fetcher(`/booking?${query.toString()}`);
      setBookings(res.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedRoomId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // 3. Delete / Cancel Booking
  const handleCancelBooking = async (id, title) => {
    if (!confirm(`Cancel booking "${title}"?`)) return;

    try {
      await fetcher("/booking/", { method: "DELETE", body: JSON.stringify({ id }) });
      toast.success(`Booking "${title}" cancelled.`);
      loadBookings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const displayedRooms = selectedRoomId
    ? rooms.filter((r) => r.id === selectedRoomId)
    : rooms;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Top Navbar Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Meeting Room Booking
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Working Hours: 09:00 – 18:00
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md transition"
            >
              Find Free Slot
            </button>
            <button
              onClick={() => {
                setPreselectedRoomId("");
                setIsBookModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Booking
            </button>
          </div>
        </header>

        {/* Filter Controls Bar */}
        <div className="my-6 bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
              <span className="text-zinc-400 font-medium">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
              <span className="text-zinc-400 font-medium">Room:</span>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">All Rooms</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id} className="bg-zinc-900">
                    {r.name} ({r.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedRoomId || selectedDate !== today) && (
            <button
              onClick={() => {
                setSelectedDate(today);
                setSelectedRoomId("");
              }}
              className="text-zinc-400 hover:text-zinc-200 underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Main Section: Room Cards Grid */}
        <main>
          {isLoading ? (
            <div className="py-16 text-center text-xs text-zinc-500">
              Loading schedules...
            </div>
          ) : displayedRooms.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No rooms found matching filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedRooms.map((room) => {
                const roomBookings = bookings.filter((b) => b.roomId === room.id);

                return (
                  <div
                    key={room.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Room Details Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-800">
                        <div>
                          <h2 className="font-semibold text-sm text-zinc-100">
                            {room.name}
                          </h2>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Capacity: {room.capacity} seats
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setPreselectedRoomId(room.id);
                            setIsBookModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded transition shrink-0"
                        >
                          + Book
                        </button>
                      </div>

                      {/* Bookings List Section */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                            Bookings ({roomBookings.length})
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {selectedDate}
                          </span>
                        </div>

                        {roomBookings.length === 0 ? (
                          <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/80 rounded bg-zinc-950/40">
                            No bookings scheduled
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {roomBookings.map((b) => (
                              <div
                                key={b.id}
                                className="bg-zinc-950 border border-zinc-800/80 rounded p-2.5 flex items-center justify-between gap-2 hover:border-zinc-700 transition"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-zinc-200 truncate">
                                    {b.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                    {b.startTime} – {b.endTime}
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleCancelBooking(b.id, b.title)}
                                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded hover:bg-zinc-900 transition shrink-0"
                                  title="Cancel booking"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Modals */}
        <CreateBookingModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          rooms={rooms}
          onSuccess={loadBookings}
          defaultDate={selectedDate}
          defaultRoomId={preselectedRoomId}
        />

        <NextSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          rooms={rooms}
          defaultDate={selectedDate}
        />
      </div>
    </div>
  );
}
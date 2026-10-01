# Meeting Room Booking System

A full-stack meeting room management application designed to handle room reservations, schedule tracking, and real-time conflict detection within business operating hours (09:00–18:00).

---

## 🔗 Live Deployments & Documentation

- **Frontend (Vercel):** [https://maviz-room-booking.vercel.app/](https://maviz-room-booking.vercel.app/)
- **Backend API (Render):** [https://meeting-room-booking-5oli.onrender.com](https://meeting-room-booking-5oli.onrender.com)
- **GitHub Repository:** [https://github.com/Anash1413/meeting_room_booking](https://github.com/Anash1413/meeting_room_booking)

---

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion, Lucide Icons, Sonner (Toasts)
- **Backend:** Node.js, Express.js *(approved alternative to FastAPI)*
- **Database & ORM:** PostgreSQL (SupaBase), Prisma ORM


---

## 🧠 The Logic Challenge: How I Approached Booking & Conflicts

### 1. Time Normalization (Minutes from Midnight)
Standard JavaScript `Date` objects frequently introduce subtle bugs when comparing recurring business hours due to UTC vs. local timezone offsets. 

To eliminate this, all incoming `HH:mm` strings are converted into **minutes from midnight**:
- `09:00` = `540` minutes
- `18:00` = `1080` minutes
- `10:30` = `630` minutes

This converts scheduling checks into fast integer arithmetic and guarantees that operating window constraints (`540 <= start < end <= 1080`) are strictly enforced.

---

### 2. Conflict Detection Evolution

#### The Initial Attempt & Where It Broke
When I first approached the overlap check, I evaluated whether an existing booking finished before the new one started:
$$\text{existingEndTime} \le \text{newStartTime}$$

While this correctly determined whether a new booking could fit *after* an existing reservation, it broke down when evaluating bookings scheduled *before* existing reservations or when one booking was completely nested inside another. It either falsely flagged non-conflicting slots or missed overlaps entirely.

#### The Refined Interval Intersection Formula
Two time intervals $[S_1, E_1)$ and $[S_2, E_2)$ collide if and only if:
$$\text{newStart} < \text{existingEnd} \quad \text{AND} \quad \text{newEnd} > \text{existingStart}$$

By using **strict inequalities (`<` and `>`)**, all edge cases are handled simultaneously:
1. **Back-to-Back Bookings (Allowed):** Booking A ends at 11:00 (`660`), Booking B starts at 11:00 (`660`). Since $660 < 660$ evaluates to `false`, no conflict is triggered.
2. **Partial Overlaps (Rejected):** A meeting running 10:00–11:30 collides with a proposed 11:00–12:00 meeting because $660 < 690$ AND $720 > 600$.
3. **Enclosed / Nested Bookings (Rejected):** A meeting running 10:30–11:00 inside an existing 10:00–12:00 slot is caught because both conditions hold true.
4. **Identical Ranges (Rejected):** Matches both boundaries.

When a collision occurs, the API returns `409 Conflict` along with the specific conflicting booking's title and hours, enabling the frontend to display an informative toast.

---

### 3. Part B: Earliest Available Slot Algorithm
The endpoint `GET /api/rooms/:roomId/next-available?date=YYYY-MM-DD&duration=X` determines the earliest free window:

1. All confirmed bookings for the room on the specified date are fetched and sorted chronologically by `startTime`.
2. A timeline `cursor` is set to opening time (`09:00` / `540` mins).
3. The algorithm iterates through existing bookings:
   - Evaluates the gap between `cursor` and the booking's `startTime`.
   - If $(\text{booking.startTime} - \text{cursor}) \ge \text{duration}$, the earliest slot is $[\text{cursor}, \text{cursor} + \text{duration}]$ and returns immediately.
   - If not, the `cursor` is advanced to $\max(\text{cursor}, \text{booking.endTime})$.
4. After the final booking, the algorithm checks the remaining window up to closing time (`18:00` / `1080` mins).
5. If no gap can accommodate the duration, it returns a 404/null status indicating the room is fully booked for that length of time.

---

## 📋 Environment Variables

### Backend (`/server/.env`)
```env
PORT=5000
DATABASE_URL
DIRECT_URL

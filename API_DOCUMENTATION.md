# 📘 Meeting Room Booking System – Simple API Documentation

Welcome! This documentation explains how the **Meeting Room Booking System API** works in super simple terms. 

Think of this API like a **reception desk** at an office. You can ask the receptionist:
1. *"What rooms do we have?"* 🚪
2. *"What meetings are booked today?"* 📅
3. *"Can I book Room A from 10:00 to 11:00?"* 📝
4. *"Can you cancel my meeting?"* ❌
5. *"When is Room A free for a 45-minute meeting?"* ⏱️

---

## 🌐 Server Base URL

All request paths start with this base link:
```text
http://localhost:5000/api
```

---

## 🚪 1. Get All Rooms

### **What does it do?**
Ask the server for a list of all meeting rooms and how many people each room can fit.

- **HTTP Method:** `GET`
- **Endpoint:** `/rooms`
- **Full URL:** `http://localhost:5000/api/rooms`
- **Request Body:** *None*

### **Example Response (Success 200 OK):**
```json
{
  "rooms": [
    {
      "id": "room_id_101",
      "name": "Conference Room A",
      "capacity": 10
    },
    {
      "id": "room_id_102",
      "name": "Boardroom B",
      "capacity": 20
    }
  ]
}
```

---

## 📅 2. Get Bookings List

### **What does it do?**
Fetch scheduled meetings. You can look at all meetings, or filter by a specific **date** or **room**.

- **HTTP Method:** `GET`
- **Endpoint:** `/booking`
- **Full URL:** `http://localhost:5000/api/booking`
- **Optional Query Parameters:**
  - `date`: Filter by date e.g. `2026-10-01`
  - `roomId`: Filter by room ID e.g. `room_id_101`

### **Example Request URL:**
```text
http://localhost:5000/api/booking?date=2026-10-01&roomId=room_id_101
```

### **Example Response (Success 200 OK):**
```json
{
  "count": 1,
  "data": [
    {
      "id": "booking_999",
      "title": "Sprint Planning",
      "date": "2026-10-01",
      "startTime": "09:00",
      "endTime": "10:30",
      "roomId": "room_id_101",
      "room": {
        "id": "room_id_101",
        "name": "Conference Room A",
        "capacity": 10
      }
    }
  ]
}
```

---

## ➕ 3. Create a New Booking

### **What does it do?**
Schedules a new meeting. 

### **Server Rules:**
1. Meetings must be between **09:00** and **18:00**.
2. **Start time** must be earlier than **End time**.
3. **No Overlaps!** If someone else already booked that room during your chosen time, the server rejects it and tells you who has the room.

- **HTTP Method:** `POST`
- **Endpoint:** `/booking`
- **Full URL:** `http://localhost:5000/api/booking`
- **Headers:** `Content-Type: application/json`

### **Request Body Example:**
```json
{
  "title": "Design Sync",
  "roomId": "room_id_101",
  "date": "2026-10-01",
  "startTime": "11:00",
  "endTime": "12:00"
}
```

### **Response A: Success (200 OK)**
```json
{
  "conflict": false,
  "message": "booking created successfully"
}
```

### **Response B: Conflict Error (400 Bad Request)**
If the room is already booked at that time:
```json
{
  "conflict": true,
  "status": 400,
  "conflictWith": {
    "title": "Sprint Planning",
    "startTime": "09:00",
    "endTime": "10:30"
  },
  "messages": "Conflict detected with booking \"Sprint Planning\" (09:00 - 10:30)"
}
```

---

## 🗑️ 4. Cancel / Delete a Booking

### **What does it do?**
Deletes an existing meeting using its unique booking ID.

- **HTTP Method:** `DELETE`
- **Endpoint:** `/booking`
- **Full URL:** `http://localhost:5000/api/booking`
- **Headers:** `Content-Type: application/json`

### **Request Body Example:**
```json
{
  "id": "booking_999"
}
```

### **Example Response (Success 200 OK):**
```json
{
  "message": "booking deleted successfully"
}
```

---

## ⏱️ 5. Find Earliest Free Slot

### **What does it do?**
Calculates the earliest available time window in a room for your requested meeting duration (in minutes) during office hours (09:00 to 18:00).

- **HTTP Method:** `POST` (or `GET`)
- **Endpoint:** `/booking/next-available`
- **Full URL:** `http://localhost:5000/api/booking/next-available`
- **Headers:** `Content-Type: application/json`

### **Request Body Example:**
```json
{
  "roomId": "room_id_101",
  "date": "2026-10-01",
  "duration": 45
}
```

### **Response A: Free Slot Found (200 OK)**
```json
{
  "AvailbleSlot": {
    "startTime": "10:30",
    "endTime": "11:15"
  }
}
```

### **Response B: No Slot Available (404 Not Found)**
If the room is fully booked for the requested duration:
```json
{
  "message": "sorry we dont have booking opt for your duration"
}
```

---

## Summary Table

| Action | HTTP Method | Endpoint Path | What you pass |
| :--- | :--- | :--- | :--- |
| **Get All Rooms** | `GET` | `/api/rooms` | Nothing |
| **Get Bookings** | `GET` | `/api/booking?date=YYYY-MM-DD&roomId=XYZ` | Query params |
| **Create Booking** | `POST` | `/api/booking` | JSON Body (`title`, `roomId`, `date`, `startTime`, `endTime`) |
| **Delete Booking** | `DELETE` | `/api/booking` | JSON Body (`id`) |
| **Find Free Slot** | `POST` | `/api/booking/next-available` | JSON Body (`roomId`, `date`, `duration`) |

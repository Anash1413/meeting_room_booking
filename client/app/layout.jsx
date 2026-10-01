// app/layout.js
import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Room Booking System",
  description: "Meeting room schedules and bookings.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        {children}
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
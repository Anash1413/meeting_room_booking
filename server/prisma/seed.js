const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean existing records to keep seed runs idempotent
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  // 2. Seed 5 Meeting Rooms
  const createdRooms = await Promise.all([
    prisma.room.create({
      data: { name: "Boardroom Alpha", capacity: 14 },
    }),
    prisma.room.create({
      data: { name: "Conference Room Blue", capacity: 8 },
    }),
    prisma.room.create({
      data: { name: "Focus Pod 1", capacity: 2 },
    }),
    prisma.room.create({
      data: { name: "Focus Pod 2", capacity: 2 },
    }),
    prisma.room.create({
      data: { name: "Innovation Lab", capacity: 6 },
    }),
  ]);

  const [boardroom, confBlue, pod1] = createdRooms;

  // 3. Seed 5 Bookings (within working hours 09:00 - 18:00)
  const bookingsData = [
    {
      title: "Sprint Planning",
      date: "2026-10-01",
      startTime: "09:30",
      endTime: "10:30",
      roomId: boardroom.id,
    },
    {
      title: "Product Roadmap Review",
      date: "2026-10-01",
      startTime: "10:30", // Back-to-back with Sprint Planning (allowed)
      endTime: "11:30",
      roomId: boardroom.id,
    },
    {
      title: "Executive Sync",
      date: "2026-10-01",
      startTime: "14:00",
      endTime: "15:30",
      roomId: boardroom.id,
    },
    {
      title: "Client Onboarding Demo",
      date: "2026-10-01",
      startTime: "11:00",
      endTime: "12:00",
      roomId: confBlue.id,
    },
    {
      title: "1-on-1 Mentorship Session",
      date: "2026-10-01",
      startTime: "15:00",
      endTime: "16:00",
      roomId: pod1.id,
    },
  ];

  for (const booking of bookingsData) {
    await prisma.booking.create({
      data: booking,
    });
  }

  console.log(`Seeding complete: ${createdRooms.length} rooms and ${bookingsData.length} bookings created.`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
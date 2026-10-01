const { prisma } = require("../utils/db");

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            date: "2026-10-01",
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });
    // console.log(rooms)
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error(error, "error occured during fetching all rooms");
    return res.status(404).json({
      errormessage: `cannot fetch rooms at this moment ${error}`,
    });
  }
};

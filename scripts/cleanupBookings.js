// jobs/cleanupBookings.js
const cron = require("node-cron");
const Booking = require("../models/Booking");
const User = require("../models/User");

function startCleanupJob() {
    cron.schedule("0 0 * * *", async () => {
        try {
            const now = new Date();
            const expiredBookings = await Booking.find({
                endDate: { $lt: now },
            });

            for (let booking of expiredBookings) {
                await User.updateOne(
                    { _id: booking.userId },
                    { $pull: { bookingsCreated: booking._id } }
                );
                await Booking.deleteOne({ _id: booking._id });
            }

            console.log(
                `[CRON] Removed ${
                    expiredBookings.length
                } expired bookings at ${now.toISOString()}`
            );
        } catch (err) {
            console.error("[CRON] Failed to clean up expired bookings:", err);
        }
    });
}

module.exports = startCleanupJob;

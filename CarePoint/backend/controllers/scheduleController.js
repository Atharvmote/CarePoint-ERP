const Schedule = require("../models/Schedule");
const Doctor = require("../models/Doctor");

// GET DOCTOR SCHEDULE
exports.getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const schedule = await Schedule.findOne({ doctor: doctorId });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY SCHEDULE (logged-in doctor)
exports.getMySchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const schedule = await Schedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      // Return default schedule if not set
      return res.json({
        _id: null,
        doctor: doctor._id,
        schedule: [
          { dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: "Tuesday", startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: "Thursday", startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: "Friday", startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: "Saturday", startTime: "09:00", endTime: "13:00", isActive: true },
          { dayOfWeek: "Sunday", startTime: "00:00", endTime: "00:00", isActive: false }
        ],
        blockedDates: [],
        breaks: [],
        slotDuration: 30
      });
    }

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE OR UPDATE SCHEDULE
exports.createOrUpdateSchedule = async (req, res) => {
  try {
    const { schedule, blockedDates, breaks, slotDuration } = req.body;

    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    let doctorSchedule = await Schedule.findOne({ doctor: doctor._id });

    if (doctorSchedule) {
      // Update existing schedule
      doctorSchedule.schedule = schedule || doctorSchedule.schedule;
      doctorSchedule.blockedDates = blockedDates || doctorSchedule.blockedDates;
      doctorSchedule.breaks = breaks || doctorSchedule.breaks;
      doctorSchedule.slotDuration = slotDuration || doctorSchedule.slotDuration;
      doctorSchedule.updatedAt = new Date();

      const updated = await doctorSchedule.save();
      return res.json(updated);
    } else {
      // Create new schedule
      const newSchedule = await Schedule.create({
        doctor: doctor._id,
        schedule,
        blockedDates,
        breaks,
        slotDuration
      });

      res.status(201).json(newSchedule);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD BLOCKED DATE
exports.addBlockedDate = async (req, res) => {
  try {
    const { date, reason } = req.body;

    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    let schedule = await Schedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      schedule = await Schedule.create({ doctor: doctor._id, schedule: [] });
    }

    schedule.blockedDates.push({ date: new Date(date), reason });
    const updated = await schedule.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE BLOCKED DATE
exports.removeBlockedDate = async (req, res) => {
  try {
    const { blockedDateId } = req.params;

    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const schedule = await Schedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    schedule.blockedDates = schedule.blockedDates.filter(
      bd => bd._id.toString() !== blockedDateId
    );

    const updated = await schedule.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD BREAK
exports.addBreak = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, reason } = req.body;

    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    let schedule = await Schedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      schedule = await Schedule.create({ doctor: doctor._id, schedule: [] });
    }

    schedule.breaks.push({ dayOfWeek, startTime, endTime, reason });
    const updated = await schedule.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE BREAK
exports.removeBreak = async (req, res) => {
  try {
    const { breakId } = req.params;

    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const schedule = await Schedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    schedule.breaks = schedule.breaks.filter(b => b._id.toString() !== breakId);

    const updated = await schedule.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

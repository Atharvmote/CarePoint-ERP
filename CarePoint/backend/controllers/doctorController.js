
// create router
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Appointment = require("../models/Appoinment.js");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");

const getTodayDate = () => new Date().toISOString().split("T")[0];

const checkAndResetNewDay = async (doctor) => {
  const todayStr = getTodayDate();
  // If lastWorkDate exists and is NOT today, it's a new day
  if (doctor.lastWorkDate && doctor.lastWorkDate !== todayStr) {
    doctor.workSecondsToday = 0;
    if (doctor.status === "online") {
      doctor.status = "offline";
      doctor.currentShiftStart = null;
    }
    doctor.lastWorkDate = todayStr;
    await doctor.save();
  }
  return doctor;
};

exports.createDoctor = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      phone,
      specialty,
      experience,
      qualification,
      fee,
      rating
    } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user login
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor"
    });

    // create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      name,
      email,
      phone,
      specialty,
      experience,
      qualification,
      fee,
      rating,
      status: "offline"
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "name email role");

    res.status(201).json(populatedDoctor);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// get doctors
exports.getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const specialty = req.query.specialty;
    const status = req.query.status;

    // Build filter
    const filter = {};
    if (specialty) filter.specialty = specialty;
    if (status) filter.status = status;

    // Execute count and find in parallel for better performance
    const [totalDocs, docs] = await Promise.all([
      Doctor.countDocuments(filter),
      Doctor.find(filter)
        .select("name email phone specialty experience qualification fee rating status")
        .populate("user", "name email")
        .lean() // Returns plain JS objects, not Mongoose docs - faster
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
    ]);

    res.json({
      data: docs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDocs / limit),
        totalDocs,
        limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update router 

exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(doctor);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

//for login 



exports.getMyDoctor = async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    doctor = await checkAndResetNewDay(doctor);
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// start of work
exports.startWork = async (req, res) => {
  try {
    const today = getTodayDate();
    let doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor = await checkAndResetNewDay(doctor);

    const update = {
      status: "online",
      currentShiftStart: new Date(),
      lastWorkDate: today,
    };

    if (doctor.lastWorkDate !== today) {
      update.workSecondsToday = 0;
    }

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      update,
      { new: true }
    ).populate("user", "name email");

    // 🔄 BROADCAST doctor status change to all connected users
    if (req.io) {
      req.io.emit("doctor-status-changed", {
        doctorId: updatedDoctor._id,
        status: "online",
        name: updatedDoctor.name,
        timestamp: new Date(),
      });
    }

    res.json({
      message: "Work started",
      status: updatedDoctor.status,
      currentShiftStart: updatedDoctor.currentShiftStart,
      workSecondsToday: updatedDoctor.workSecondsToday || 0,
      doctor: updatedDoctor,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//for end of work....
exports.endWork = async (req, res) => {
  try {
    const today = getTodayDate();
    let doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor = await checkAndResetNewDay(doctor);

    if (doctor.status === "offline") {
      return res.json({
        message: "Already offline",
        status: doctor.status,
        workSecondsToday: doctor.workSecondsToday || 0,
      });
    }

    let additionalSeconds = 0;
    if (doctor.currentShiftStart) {
      additionalSeconds = Math.floor((new Date() - new Date(doctor.currentShiftStart)) / 1000);
    }

    const workSecondsToday = (doctor.workSecondsToday || 0) + additionalSeconds;

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      {
        status: "offline",
        currentShiftStart: null,
        workSecondsToday,
        lastWorkDate: today,
      },
      { new: true }
    ).populate("user", "name email");

    // 🔄 BROADCAST doctor status change to all connected users
    if (req.io) {
      req.io.emit("doctor-status-changed", {
        doctorId: updatedDoctor._id,
        status: "offline",
        name: updatedDoctor.name,
        timestamp: new Date(),
      });
    }

    res.json({
      message: "Work ended",
      status: updatedDoctor.status,
      workSecondsToday: updatedDoctor.workSecondsToday || 0,
      doctor: updatedDoctor,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// this is used to get dr dashboard 
exports.getDoctorDashboard = async (req, res) => {
  try {

    let doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    doctor = await checkAndResetNewDay(doctor);

    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaysAppointments = await Appointment.find({
        doctor: doctor._id
      }).populate("patient", "name email");

      const todayStr = new Date().toISOString().split("T")[0];

      

      const filtered = todaysAppointments.filter(a => {
        const appointmentDate = new Date(a.date);

        return (
          appointmentDate.getDate() === today.getDate() &&
          appointmentDate.getMonth() === today.getMonth() &&
          appointmentDate.getFullYear() === today.getFullYear()
        );
      });

      const completed = filtered.filter(a => a.status === "completed").length;
      const pending = filtered.filter(a => a.status !== "completed").length;
      const nextAppointment = filtered.find(a => a.status === "scheduled");
      const upcomingAppointments = todaysAppointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate > today && a.status === "scheduled";
      });
      upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    let workSecondsToday = doctor.workSecondsToday || 0;

    if (doctor.status === "online" && doctor.currentShiftStart) {
      const secondsElapsed = Math.floor((new Date() - new Date(doctor.currentShiftStart)) / 1000);
      workSecondsToday += secondsElapsed > 57600 ? 57600 : secondsElapsed;
    }

    res.json({
      totalToday: filtered.length,
      completed,
      pending,
      nextAppointment: nextAppointment ? nextAppointment.time : null,
      todayAppointments: filtered,
      upcomingAppointments,
      workHoursToday: workSecondsToday,
      doctorStatus: doctor.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PATIENT HISTORY (For doctors viewing patient background)
exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get all appointments
    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "user specialty")
      .sort({ createdAt: -1 });

    // Get all medical records
    const medicalRecords = await MedicalRecord.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get all prescriptions
    const prescriptions = await Prescription.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get patient info
    const patient = await User.findById(patientId).select('name email phone');

    // Calculate health trends
    const vitalsTrends = medicalRecords
      .filter(r => r.vitalSigns)
      .map(r => ({
        date: r.createdAt,
        bloodPressure: r.vitalSigns?.bloodPressure,
        temperature: r.vitalSigns?.temperature,
        pulse: r.vitalSigns?.pulse,
        weight: r.vitalSigns?.weight
      }))
      .reverse();

    // Get chronic conditions/allergies (from medical records)
    const diagnoses = new Set();
    medicalRecords.forEach(r => {
      if (r.diagnosis) {
        if (Array.isArray(r.diagnosis)) {
          r.diagnosis.forEach(d => diagnoses.add(d));
        } else {
          diagnoses.add(r.diagnosis);
        }
      }
    });

    res.json({
      patient,
      appointments,
      medicalRecords,
      prescriptions,
      vitalsTrends,
      chronicConditions: Array.from(diagnoses),
      appointmentCount: appointments.length,
      recordCount: medicalRecords.length,
      prescriptionCount: prescriptions.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

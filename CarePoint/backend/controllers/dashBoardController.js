const Resource = require("../models/Resources");
const Slot = require("../models/Slot");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appoinment");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");

exports.getEmergencyDashboard = async (req,res) => {
  try {

    const resources = await Resource.find();

    const critical = resources.filter(r => r.status === "Critical");
    const low = resources.filter(r => r.status === "Low");

    const today = new Date().toISOString().split("T")[0];

    const todaySlots = await Slot.find({ date: today });
    const bookedToday = todaySlots.filter(s => s.status === "Booked");

    // Doctor Status Breakdown
    const doctors = await Doctor.find().populate('user');
    const onlineDoctors = doctors.filter(d => d.status === 'online');
    const busyDoctors = doctors.filter(d => d.status === 'busy');
    const offlineDoctors = doctors.filter(d => d.status === 'offline');

    // Appointment Status Breakdown
    const appointments = await Appointment.find().populate('patient doctor');
    const scheduledAppts = appointments.filter(a => a.status === 'scheduled');
    const inProgressAppts = appointments.filter(a => a.status === 'in-progress');
    const completedAppts = appointments.filter(a => a.status === 'completed');
    const cancelledAppts = appointments.filter(a => a.status === 'cancelled');

    // Today's appointments
    const todayAppts = appointments.filter(a => {
      const apptDate = new Date(a.date).toISOString().split('T')[0];
      return apptDate === today;
    });

    // Patient count
    const patients = await User.find({ role: 'patient' });
    
    // Medical records and prescriptions count
    const medicalRecords = await MedicalRecord.find();
    const prescriptions = await Prescription.find();

    res.json({
      // Resources
      totalResources: resources.length,
      criticalCount: critical.length,
      lowCount: low.length,
      criticalResources: critical,
      lowResources: low,

      // Slot stats
      todayTotalSlots: todaySlots.length,
      todayBookedSlots: bookedToday.length,
      todayAvailableSlots: todaySlots.length - bookedToday.length,

      // Doctor stats
      totalDoctors: doctors.length,
      onlineDoctors: onlineDoctors.length,
      busyDoctors: busyDoctors.length,
      offlineDoctors: offlineDoctors.length,
      doctorsList: doctors,

      // Appointment stats
      totalAppointments: appointments.length,
      scheduledAppointments: scheduledAppts.length,
      inProgressAppointments: inProgressAppts.length,
      completedAppointments: completedAppts.length,
      cancelledAppointments: cancelledAppts.length,
      todayAppointments: todayAppts,

      // Patient stats
      totalPatients: patients.length,

      // Medical data
      totalMedicalRecords: medicalRecords.length,
      totalPrescriptions: prescriptions.length,

      // Recent appointments (last 5)
      recentAppointments: appointments.slice(-5).reverse()
    });

  } catch(err){
    res.status(500).json(err.message);
  }
};

const Rating = require("../models/Rating");
const Appointment = require("../models/Appoinment");

// CREATE RATING/REVIEW
exports.createRating = async (req, res) => {
  try {
    const { appointmentId, rating, review, categories } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if patient is authorized
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ appointment: appointmentId });
    if (existingRating) {
      return res.status(400).json({ message: "This appointment has already been rated" });
    }

    // Create rating
    const newRating = await Rating.create({
      appointment: appointmentId,
      patient: req.user.id,
      doctor: appointment.doctor,
      rating,
      review: review || "",
      categories: categories || {}
    });

    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET RATINGS FOR A DOCTOR
exports.getDoctorRatings = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const ratings = await Rating.find({ doctor: doctorId })
      .populate("patient", "name")
      .populate("appointment", "date")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    const avgCategories = ratings.length > 0 ? {
      communication: (ratings.reduce((sum, r) => sum + (r.categories?.communication || 5), 0) / ratings.length).toFixed(1),
      professionalism: (ratings.reduce((sum, r) => sum + (r.categories?.professionalism || 5), 0) / ratings.length).toFixed(1),
      punctuality: (ratings.reduce((sum, r) => sum + (r.categories?.punctuality || 5), 0) / ratings.length).toFixed(1),
      cleanliness: (ratings.reduce((sum, r) => sum + (r.categories?.cleanliness || 5), 0) / ratings.length).toFixed(1)
    } : { communication: 0, professionalism: 0, punctuality: 0, cleanliness: 0 };

    res.json({
      ratings,
      averageRating: avgRating,
      totalRatings: ratings.length,
      averageByCategory: avgCategories
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET RATING FOR SINGLE APPOINTMENT
exports.getAppointmentRating = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const rating = await Rating.findOne({ appointment: appointmentId })
      .populate("patient", "name");

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE RATING
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, categories } = req.body;

    const existingRating = await Rating.findById(id);
    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Check if authorized
    if (existingRating.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      id,
      { rating, review, categories },
      { new: true }
    );

    res.json(updatedRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE RATING
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Check if authorized
    if (rating.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Rating.findByIdAndDelete(id);
    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PATIENT'S RATINGS
exports.getPatientRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ patient: req.user.id })
      .populate("doctor", "user specialization")
      .populate("appointment", "date")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

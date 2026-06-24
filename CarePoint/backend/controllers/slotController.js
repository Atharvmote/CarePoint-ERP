const Slot = require("../models/Slot");

exports.createSlot = async (req,res) => {
  try {
    const { doctor, date, time } = req.body;

    // conflict check
    const exists = await Slot.findOne({ doctor, date, time });
    if(exists)
      return res.status(400).json({msg:"Slot already exists"});

    const slot = await Slot.create(req.body);
    res.json(slot);

  } catch(err){
    res.status(500).json(err.message);
  }
};


exports.bookSlot = async (req,res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if(!slot)
      return res.status(404).json({msg:"Slot not found"});
    if(slot.status === "Booked")
      return res.status(400).json({msg:"Already booked"});
    slot.status = "Booked";
    await slot.save();
    res.json(slot);
  } catch(err){
    res.status(500).json(err.message);
  }
};


exports.getSlots = async (req, res) => {
  try {
    let { doctorId, date } = req.query;
    console.log(doctorId,date)
    // normalize date (VERY IMPORTANT)
    date = new Date(date).toISOString().split("T")[0];

    let slots = await Slot.find({ doctor: doctorId, date });

    if (slots.length === 0) {
      const defaultTimes = [
        '09:00 AM','09:30 AM','10:00 AM','10:30 AM',
        '11:00 AM','11:30 AM','02:00 PM','02:30 PM',
        '03:00 PM','03:30 PM','04:00 PM','04:30 PM'
      ];

      const newSlots = defaultTimes.map(time => ({
        doctor: doctorId,
        date,
        time,
        status: "Available"
      }));

      await Slot.insertMany(newSlots);

      slots = await Slot.find({ doctor: doctorId, date });
    }

    res.json(slots);

  } catch (err) {
    res.status(500).json(err.message);
  }
};
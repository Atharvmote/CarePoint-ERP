const Resource = require("../models/Resources");
const { notifyAdmins } = require("../utils/notify");

function calcStatus(total, available){
  const ratio = available / total;

  if(ratio <= 0.2) return "Critical";
  if(ratio <= 0.5) return "Low";
  return "Normal";
}

exports.createResource = async (req,res) => {
  const r = await Resource.create(req.body);
  res.json(r);
};

exports.getResources = async (req,res) => {
  try {
    const data = await Resource.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAvailability = async (req,res) => {
  const { available } = req.body;

  const r = await Resource.findById(req.params.id);

  r.available = available;
  r.status = calcStatus(r.total, available);

  await r.save();
  
  if (r.status === "Critical" || r.status === "Low") {
    await notifyAdmins(req, "admin-alert", `Resource Alert: ${r.status}`, `Resource ${r.name} is running ${r.status.toLowerCase()} (${available} remaining)`, r._id);
  }

  res.json(r);
};

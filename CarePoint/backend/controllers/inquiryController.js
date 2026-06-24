const Inquiry = require("../models/Inquiry");
const { notifyAdmins } = require("../utils/notify");

exports.createInquiry = async (req,res) => {
  try {
    const inquiry = await Inquiry.create({
      ...req.body,
      createdBy: req.user.id
    });

    await notifyAdmins(req, "admin-alert", "New Inquiry", `New inquiry received for ${inquiry.department || 'general'} department`, inquiry._id);

    res.json(inquiry);
  } catch(err){
    res.status(500).json(err.message);
  }
};


exports.getAllInquiries = async (req,res) => {
  try {
    const data = await Inquiry.find().sort({createdAt:-1});
    res.json(data);
  } catch(err){
    res.status(500).json(err.message);
  }
};


exports.updateStatus = async (req,res) => {
  try {
    const { status } = req.body;

    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new:true }
    );

    res.json(updated);
  } catch(err){
    res.status(500).json(err.message);
  }
};

const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { inquirySchema } = require("../validators/inquiryValidator");
const validate = require("../middleware/validate");


const {
  createInquiry,
  getAllInquiries,
  updateStatus
} = require("../controllers/inquiryController");

router.post("/", protect, validate(inquirySchema),createInquiry);
router.get("/", protect, getAllInquiries);
router.patch("/:id/status", protect, updateStatus);

module.exports = router;

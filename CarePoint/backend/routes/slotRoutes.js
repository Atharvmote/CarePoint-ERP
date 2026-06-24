const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createSlot,
  bookSlot,
  getSlots
} = require("../controllers/slotController");

router.post("/", protect, role("admin"), createSlot);
router.post("/:id/book", protect, bookSlot);
router.get("/", getSlots);

module.exports = router;

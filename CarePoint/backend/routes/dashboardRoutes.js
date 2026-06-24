const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");

const { getEmergencyDashboard } =
  require("../controllers/dashBoardController");

router.get("/emergency", protect, getEmergencyDashboard);

module.exports = router;

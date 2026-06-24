const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createResource,
  getResources,
  updateAvailability
} = require("../controllers/resourceController");

router.post("/", protect, role("admin"), createResource);
router.get("/", protect, getResources);
router.patch("/:id", protect, role("admin"), updateAvailability);

module.exports = router;

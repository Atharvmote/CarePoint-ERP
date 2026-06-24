const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/admin-only", protect, role("admin"), (req,res)=>{
  res.json("Welcome Admin — Protected Route Works");
});

module.exports = router;

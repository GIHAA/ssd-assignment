const express = require("express");
const router = express.Router();
const {
  addbreed,
  getallbreeds,
  breedUpdate,
  deletebreed,
} = require("../controller/breedController");
const { protect } = require("../middleware/authMiddleware");

router.post("/addbreed", protect , addbreed);
router.get("/getbreed", protect , getallbreeds);
router.put("/breedupdate/:id", protect , breedUpdate);
router.delete("/deletebreed/:id", protect ,  deletebreed);

module.exports = router;

const express = require('express');
const {
  readVehicle,
  addVehicle,
  getOneVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicleByPlateNo,
  getVCount,
} = require('../controller/vehicleController');
const validateVehicle = require('../middleware/vehicleMiddleware');
const {
  protect,
  userProtect,
  adminProtect,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, validateVehicle, addVehicle);
router.put('/:id', protect, validateVehicle, updateVehicle);

router.get('/', protect, readVehicle);
router.get('/:id', protect, getOneVehicle);
router.delete('/:id', protect, deleteVehicle);
router.get('/search/:plateNo', protect, searchVehicleByPlateNo);
router.get('/vcount', protect, getVCount);

module.exports = router;

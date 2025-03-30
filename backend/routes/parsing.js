
const express = require('express');
const router = express.Router();
const esportsController = require("../controllers/esportsController");

router.get('/', esportsController.startParsing);
router.get('/clear', esportsController.resetRegions);
module.exports = router;

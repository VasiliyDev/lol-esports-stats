
const express = require('express');
const router = express.Router();
const championController = require("../controllers/championController");

router.get('/', championController.getAllChampions);
router.get('/categories', championController.getAllCategories);
router.put('/:id/category', championController.setChampionCategory);
module.exports = router;
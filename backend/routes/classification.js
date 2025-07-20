const express = require('express');
const router = express.Router();
const classificationController = require("../controllers/classificationController");

// ================== CLASSIFICATIONS ==================

// Get all classifications (with parameters as sub field)
router.get('/', classificationController.getAllClassifications);

// Get full info of classification (with champions and their stats)
router.get('/:id/full', classificationController.getClassificationFullInfo);

// Get a classification by ID
router.get('/:id', classificationController.getClassificationById);

// Create a new classification
router.post('/', classificationController.createClassification);

// Rename a classification
router.put('/:id/rename', classificationController.renameClassification);

// Delete a classification
router.delete('/:id', classificationController.deleteClassification);

// ================== CLASSIFICATION PARAMETERS ==================

// Get all classification parameters
router.get('/parameters', classificationController.getAllClassificationParameters);

// Get classification parameters by classification ID
router.get('/:classificationId/parameters', classificationController.getClassificationParametersByClassificationId);

// Get a classification parameter by ID
router.get('/parameters/:id', classificationController.getClassificationParameterById);

// Create a new classification parameter
router.post('/parameters', classificationController.createClassificationParameter);

// Update a classification parameter
router.put('/parameters/:id', classificationController.updateClassificationParameter);

// Delete a classification parameter
router.delete('/parameters/:id', classificationController.deleteClassificationParameter);

// Add this route to your existing routes
// Update classification champion parameters (bulk update)
router.put('/champion-parameters', classificationController.updateClassificationChampionParameters);
module.exports = router;
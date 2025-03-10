// routes/eventRoutes.js
const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

// GET all events
router.get('/', eventController.getAllEvents);

// GET unparsed events
router.get('/unparsed', eventController.getUnparsedEvents);

// GET specific event by ID
router.get('/:id', eventController.getEventById);

// POST create new event
router.post('/', eventController.createEvent);

// PUT update existing event
router.put('/:id', eventController.updateEvent);

// PATCH mark event as parsed
router.patch('/:id/mark-parsed', eventController.markEventAsParsed);

// DELETE event
router.delete('/:id', eventController.deleteEvent);

router.post('/start-parsing', eventController.startParsing)

module.exports = router;

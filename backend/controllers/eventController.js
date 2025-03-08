// controllers/eventController.js
const models = require('../models');
const logger = require('../utils/logger');
const {main:mainParse} = require("../services/parsingService");

// The Event model is now accessible as models.Event

/**
 * Get all events
 */
const getAllEvents = async (req, res) => {
    try {
        const events = await models.Event.findAll();
        return res.json(events);
    } catch (error) {
        logger.error(`Error fetching events: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch events'
        });
    }
};

/**
 * Get a single event by ID
 */
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await models.Event.findByPk(id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        return res.json(event);
    } catch (error) {
        logger.error(`Error fetching event ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch event'
        });
    }
};

/**
 * Create a new event
 */
const createEvent = async (req, res) => {
    try {
        console.log(req.body);

        // Check if link exists in request
        if (!req.body.link) {
            return res.status(400).json({
                status: 'error',
                message: 'Event link is required'
            });
        }

        // Check if event with this link already exists
        const existingEvent = await models.Event.findOne({
            where: { link: req.body.link }
        });

        if (existingEvent) {
            return res.status(409).json({
                status: 'error',
                message: 'Event with this link already exists',
                event: existingEvent
            });
        }

        const eventData = { ...req.body };

        // If link is provided but name is not, use link as name
        if (eventData.link && !eventData.name) {
            eventData.name = eventData.link;
        }

        // Setting default values (though these are likely already handled by your model)
        eventData.parsed_at = null;
        eventData.parsed = false;

        console.log(eventData);
        const newEvent = await models.Event.create(eventData);
        return res.status(201).json(newEvent);
    } catch (error) {
        logger.error(`Error creating event: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create event'
        });
    }
};

/**
 * Update an existing event
 */
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await models.Event.update(req.body, {
            where: { id }
        });

        if (updated === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        const updatedEvent = await models.Event.findByPk(id);
        return res.json(updatedEvent);
    } catch (error) {
        logger.error(`Error updating event ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update event'
        });
    }
};

/**
 * Delete an event
 */
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await models.Event.destroy({
            where: { id }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting event ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete event'
        });
    }
};

/**
 * Get unparsed events
 */
const getUnparsedEvents = async (req, res) => {
    try {
        const unparsedEvents = await models.Event.findAll({
            where: {
                parsed: false
            }
        });

        return res.json(unparsedEvents);
    } catch (error) {
        logger.error(`Error fetching unparsed events: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch unparsed events'
        });
    }
};

/**
 * Mark an event as parsed
 */
const markEventAsParsed = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await models.Event.update({
            parsed: true,
            parsed_at: new Date()
        }, {
            where: { id }
        });

        if (updated === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        const updatedEvent = await models.Event.findByPk(id);
        return res.json(updatedEvent);
    } catch (error) {
        logger.error(`Error marking event ${req.params.id} as parsed: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to mark event as parsed'
        });
    }
};


const startParsing = async (req, res) => {
    try {

            // Get all unparsed events
            const unparsedEvents = await models.Event.findAll({
                where: {
                    parsed: false
                }
            });

            if (unparsedEvents.length === 0) {
                return res.json({
                    status: 'success',
                    message: 'No unparsed events found'
                });
            }

            logger.info(`Starting to parse ${unparsedEvents.length} unparsed events`);

            const results = [];
            // Process each unparsed event
            for (const event of unparsedEvents) {
                try {
                    // Assuming mainParse can accept an event object or URL
                    const result = await mainParse(event.link, event.id);

                    // Mark the event as parsed
                    await models.Event.update({
                        parsed: true,
                        parsed_at: new Date()
                    }, {
                        where: { id: event.id }
                    });

                    results.push({
                        eventId: event.id,
                        status: 'success',
                        data: result
                    });

                } catch (error) {
                    logger.error(`Error parsing event ${event.id}: ${error.message}`);
                    results.push({
                        eventId: event.id,
                        status: 'error',
                        message: error.message
                    });
                }
            }

            return res.json({
                status: 'success',
                totalProcessed: unparsedEvents.length,
                results
            });


    } catch (error) {
        logger.error(`Error in startParsing: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to parse'
        });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getUnparsedEvents,
    markEventAsParsed,
    startParsing
};

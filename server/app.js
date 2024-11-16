// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const { Musician, Band, Instrument } = require('./db/models');

// Express using json - DO NOT MODIFY
app.use(express.json());

// Pagination middleware
const paginationMiddleware = (req, res, next) => {
  let { page, size } = req.query;

  page = parseInt(page, 10) || 1; // Default to page 1 if undefined or invalid
  size = parseInt(size, 10) || 5; // Default to size 5 if undefined or invalid

  if (page < 0) page = 1; // Ensure page is non-negative
  if (size < 0) size = 5; // Ensure size is non-negative

  const offset = size * (page - 1);

  req.pagination = {
    offset: page === 0 ? 0 : offset,
    limit: page === 0 ? null : size, // If page 0, fetch all results (no limit)
  };

  next(); // Call the next middleware or route handler
};

app.get('/musicians', paginationMiddleware, async (req, res, next) => {
  // Parse the query params, set default values, and create appropriate
  // offset and limit values if necessary.
  // Your code here
  const { offset, limit } = req.pagination;

  // Query for all musicians
  // Include attributes for `id`, `firstName`, and `lastName`
  // Include associated bands and their `id` and `name`
  // Order by musician `lastName` then `firstName`
  const musicians = await Musician.findAll({
    attributes: ['id', 'firstName', 'lastName'],
    include: [
      {
        model: Band,
        attributes: ['id', 'name'],
      },
    ],
    // add limit key-value to query
    // add offset key-value to query
    // Your code here
    offset: offset,
    limit: limit,
    order: [['lastName'], ['firstName']],
  });

  res.json(musicians);
});

// BONUS: Pagination with bands
app.get('/bands', paginationMiddleware, async (req, res, next) => {
  // Parse the query params, set default values, and create appropriate
  // offset and limit values if necessary.
  // Your code here
  const { offset, limit } = req.pagination;
  // Query for all bands
  // Include attributes for `id` and `name`
  // Include associated musicians and their `id`, `firstName`, and `lastName`
  // Order by band `name` then musician `lastName`
  const bands = await Band.findAll({
    order: [['name'], [Musician, 'lastName']],
    attributes: ['id', 'name'],
    include: [
      {
        model: Musician,
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
    // add limit key-value to query
    // add offset key-value to query
    // Your code here
    limit: limit,
    offset: offset,
  });

  res.json(bands);
});

// BONUS: Pagination with instruments
app.get('/instruments', paginationMiddleware, async (req, res, next) => {
  // Parse the query params, set default values, and create appropriate
  // offset and limit values if necessary.
  // Your code here
  const { offset, limit } = req.pagination;
  // Query for all instruments
  // Include attributes for `id` and `type`
  // Include associated musicians and their `id`, `firstName` and `lastName`
  // Omit the MusicianInstruments join table attributes from the results
  // Include each musician's associated band and their `id` and `name`
  // Order by instrument `type`, then band `name`, then musician `lastName`
  const instruments = await Instrument.findAll({
    order: [['type'], [Musician, Band, 'name'], [Musician, 'lastName']],
    attributes: ['id', 'type'],
    include: [
      {
        model: Musician,
        attributes: ['id', 'firstName', 'lastName'],
        // Omit the join table (MusicianInstruments) attributes
        through: { attributes: [] },
        include: [
          {
            model: Band,
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
    // add limit key-value to query
    // add offset key-value to query
    // Your code here
    limit: limit,
    offset: offset,
  });

  res.json(instruments);
});

// ADVANCED BONUS: Reduce Pagination Repetition
// Your code here

// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
  res.json({
    message: 'API server is running',
  });
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 5000;
app.listen(port, () => console.log('Server is listening on port', port));

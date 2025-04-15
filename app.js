'use strict';

// data to be sent to an EJS view for dynamic output
const viewData = {
  title: 'My Node.js Portfolio',
  pages: [
    { linkName: 'Home', path: '/' },
    { linkName: 'About', path: '/about.html' },
    { linkName: 'Projects', path: '/projects.html' },
    { linkName: 'Contact', path: '/contact.html' },
  ],
  tech: [
    'Angular',
    'ASPNET Identity',
    'AWS Lambda',
    'Bootstrap',
    'C#',
    'CSS',
    'Dart',
    'DynamoDB',
    'EJS',
    'Express.js',
    'Flutter',
    'HTML',
    'JavaScript',
    'MongoDB',
    'MVC',
    'Node.js',
    'Python',
    'React',
    'RESTful APIs',
    'SCSS',
    'SQLite',
    'Vue.js',
  ],
};

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

require('dotenv').config(); // Load environment variables from a .env file into process.env
const uri = process.env.MONGO_URI; // Access MONGO URI from .env file

// Database setup
const { mongoose } = require('mongoose');

// set up default mongoose connection
mongoose.connect(uri);

// store a reference to the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// routers
const indexRouter = require('./routers/indexRouter');
const projectsRouter = require('./routers/projectsRouter');

const port = process.env.PORT || 3000;
const app = express();

// Attach viewData to app.locals
app.locals.viewData = viewData;

// allow cross origin requests from this machine
app.use(cors({ origin: [/127.0.0.1*/, /localhost*/] }));

// Middleware
app.use(morgan('dev')); // Logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Set up for EJS

// Enable layouts
app.use(expressLayouts);
// Set the default layout
app.set('layout', './layouts/full-width');

// Make views folder globally accessible
app.set('views', path.join(__dirname, 'views'));

// Tell express that we'll be using the EJS templating engine
app.set('view engine', 'ejs');

// index routes
app.use(indexRouter);

// projects routes
app.use('/projects', projectsRouter);

// set up static file serving for uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// handle unrecognized routes
app.get('*', function (req, res) {
  res.status(404).send('<h2 class="error">File Not Found</h2>');
});

// start listening
app.listen(port, () => console.log(`Projects app listening on port ${port}!`));

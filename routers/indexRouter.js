const express = require('express');
const indexRouter = express.Router();

indexRouter.get('/', (req, res) => {
    res.render('index', {...req.app.locals.viewData, pageTitle: 'Welcome to My Node.js Portfolio'});});

indexRouter.get('/about', (req, res) => {
    res.render('about', {...req.app.locals.viewData, pageTitle: 'About Me'})});

indexRouter.get('/contact', (req, res) => {
    res.render('contact', {...req.app.locals.viewData, pageTitle: 'Contact Me', status: null })});

indexRouter.post('/contact', (req, res) => {
    const Contact = require('../models/Contact');
    let contact = new Contact(req.body);
    contact.save();

    res.render(
        'contact', 
        {...req.app.locals.viewData, pageTitle: 'Contact Me', status: 'received', formData: req.body,}
    );});

module.exports = indexRouter;

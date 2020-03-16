const logic = require('./logic');
const express = require('express');
const app = express();
const url = require('body-parser');
const port = '3000';

app.use(url.json());
app.listen(port, () => console.log(`Event app listening on port ${port}!`));

var events = [];
var bookings = [];
var errorMessages = [
    'All good.',
    'The request body is undefined.',
    'Name is missing.',
    'Capacity must be a number larger or equal to 0.',
    'StartDate is missing.',
    'StartDate can not be in the past.',
    'EndDate is missing.',
    'EndDate can not be before the StartDate.',
    'Description is missing.',
    'Location is missing.',
    'FirstName is missing.',
    'LastName is missing.',
    'Spots must be a number larger or equal to 0.',
    'Tel must be a number.',
    'Tel and Email can not both be missing.',
    'There are existing bookings for this event so it cant be updated.',
    'There are existing bookings for this event so it cant be deleted.'
];
//--------------------------------------------------------------------//
//-------------------------------EVENTS-------------------------------//
//--------------------------------------------------------------------//

// 1. Read all events
app.get('/api/v1/events', (req, res) => {
    let shortEvents = [];
    events.forEach(event => {
        shortEvents.push({ name: event.name, id: event.id, capacity: event.capacity, startDate: event.startDate, endDate: event.endDate });
    });
    res.status(200).json(shortEvents);
});

// 2. Read an individual event
app.get('/api/v1/events/:eId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            res.status(200).json(events[i]);
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});

// 3. Create a new event
app.post('/api/v1/events', (req, res) => {
    let validationCode = logic.eventValidation(req.query);
    if (validationCode) {
        res.status(400).json({ message: errorMessages[validationCode] });
    } else {
        let startDateUTC = eval(req.query.startDate)
        let endDateUTC = eval(req.query.endDate)
        let newEvent = Object(
            {
                id: logic.getNewEventId(),
                name: req.query.name,
                description: req.query.description,
                location: req.query.location,
                capacity: Number(req.query.capacity),
                startDate: startDateUTC.toUTCString(),
                endDate: endDateUTC.toUTCString(),
                bookings: []
            }
        );
        events.push(newEvent);
        res.status(201).json(newEvent);
    }
});

// 4. Update an event
app.put('/api/v1/events/:eId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            if (events[i].bookings.length == 0) {
                validationCode = logic.eventUpdateValidation(req.query);
                if (validationCode) {
                    res.status(400).json({ message: errorMessages[validationCode] });
                } else {
                    events[i].name = req.query.name;
                    events[i].description = req.query.description;
                    events[i].location = req.query.location;
                    events[i].capacity = Number(req.query.capacity);
                    let startDateUTC = eval(req.query.startDate)
                    events[i].startDate = startDateUTC.toUTCString();
                    let endDateUTC = eval(req.query.endDate)
                    events[i].endDate = endDateUTC.toUTCString();
                    res.status(200).json(events[i]);
                    return;
                }
            }
            else {
                res.status(400).json({ message: errorMessages[15] });
                return;
            }
        }
    }
    res.status(404).json({ message: 'event not found' });
});

// 5. Delete an event
app.delete('/api/v1/events/:eId', (req, res) => {
    let deletedEvent = [];
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            if (events[i].bookings.length == 0) {
                deletedEvent = events[i];
                events.splice(i--, 1)
                res.status(200).json(deletedEvent);
                return;
            }
            else {
                res.status(400).json({ message: errorMessages[16] });
                return;
            }
        }
    }
    res.status(404).json({ message: 'event not found' });
});

// 6. Delete all events
app.delete('/api/v1/events', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        let bks = [];
        for (let j = 0; j < bookings.length; j++) {
            events[i].bookings.forEach(bId => {
                if (Number(bookings[j].id) === Number(bId)) {
                    bks.push(bookings[j]);
                }
            });
        }
        events[i].bookings = bks;
    }
    res.status(200).json(events);
    events = [];
    bookings = [];
});

//----------------------------------------------------------------------//
//-------------------------------BOOKINGS-------------------------------//
//----------------------------------------------------------------------//

// 1. Read all bookings for an event
app.get('/api/v1/events/:eId/bookings', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            let bks = [];
            for (let j = 0; j < bookings.length; j++) {
                events[i].bookings.forEach(bId => {
                    if (Number(bookings[j].id) === Number(bId)) {
                        bks.push(bookings[j]);
                    }
                });
            }
            res.status(200).json(bks);
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});

// 2. Read an individual booking
app.get('/api/v1/events/:eId/bookings/:bId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            for (let j = 0; j < bookings.length; j++) {
                if (Number(bookings[j].id) === Number(req.params.bId)) {
                    for (let k = 0; k < events[i].bookings.length; k++) {
                        if (Number(events[i].bookings[k]) === Number(req.params.bId)) {
                            res.status(200).json(bookings[j]);
                            return;
                        }
                    }
                    res.status(404).json({ message: 'booking found but does not belong to this event.' });
                    return;
                }
            }
            res.status(404).json({ message: 'booking not found.' });
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});

// 3. Create a new booking
app.post('/api/v1/events/:eId/bookings', (req, res) => {
    let validationCode = logic.bookingValidation(req.query);
    if (validationCode) {
        res.status(400).json({ message: errorMessages[validationCode] });
    } else {
        let newBooking = Object(
            {
                id: logic.getNewBookingId(),
                firstName: req.query.firstName,
                lastName: req.query.lastName,
                spots: Number(req.query.spots),
                email: req.query.email,
                tel: Number(req.query.tel)
            }
        );
        let bookingEvent = logic.findEventWithID(events, req.params.eId);
        if (bookingEvent !== null) {
            bookingEvent.bookings.push(newBooking.id);
            bookings.push(newBooking)
            res.status(201).json(newBooking);
            return;
        }
        res.status(404).json({ message: 'event not found.' });
    }
});

// 4. Delete a booking
app.delete('/api/v1/events/:eId/bookings/:bId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            for (let j = 0; j < bookings.length; j++) {
                if (Number(bookings[j].id) === Number(req.params.bId)) {
                    for (let k = 0; k < events[i].bookings.length; k++) {
                        if (Number(events[i].bookings[k]) === Number(req.params.bId)) {
                            events[i].bookings.splice(k--, 1);
                            deletedBooking = bookings[j];
                            bookings.splice(j--, 1);
                            res.status(202).json(deletedBooking);
                            return;
                        }
                    }
                    res.status(404).json({ message: 'booking found but does not belong to this event.' });
                    return;
                }
            }
            res.status(404).json({ message: 'booking not found.' });
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});

// 5. Delete all bookings for an event
app.delete('/api/v1/events/:eId/bookings', (req, res) => {
    let deletedBookings = [];
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            for (let j = 0; j < bookings.length; j++) {
                for (let k = 0; k < events[i].bookings.length; k++) {
                    if (bookings[j] !== undefined) {
                        if (Number(bookings[j].id) === Number(events[i].bookings[k])) {
                            deletedBookings.push(bookings.splice(j--, 1));
                        }
                    }
                }
            }
            events[i].bookings = []
            res.status(200).json(deletedBookings);
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});

// Unknown commands

app.use('*', (req, res) => {
    res.status(405).json({ message: 'Operation not supported.' });
});
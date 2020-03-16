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
    'Capacity is missing.',
    'StartDate is missing.',
    'EndDate is missing.',
    'Description is missing.',
    'Location is missing.',
    'FirstName is missing.',
    'LastName is missing.',
    'Spots is missing.',
    'Tel and Email are both be missing.',
    'Capacity must be a number.',
    'StartDate must be a number.',
    'EndDate must be a number.',
    'Spots must be a number.',
    'Tel must be a number.',
    'Capacity can not be a NaN.',
    'StartDate can not be a NaN.',
    'EndDate can not be a NaN.',
    'Spots can not be a NaN.',
    'Tel can not be a NaN.',
    'Capacity must be >= 0.',
    'StartDate can not be <= dateNow.',
    'EndDate can not be <= StartDate.',
    'Spots must be >= 0.',
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
    return;
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
    return;
});

// 3. Create a new event
app.post('/api/v1/events', (req, res) => {
    let validation = logic.eventValidation(req.body);
    if (validation) {
        res.status(400).json({ message: errorMessages[validation] });
    } else {
        let newEvent = Object(
            {
                id: logic.getNewEventId(),
                name: req.body.name,
                description: req.body.description,
                location: req.body.location,
                capacity: Number(req.body.capacity),
                startDate: new Date(req.body.startDate*1000).toString(),
                endDate: new Date(req.body.endDate*1000).toString(),
                bookings: []
            }
        );
        events.push(newEvent);
        res.status(201).json(newEvent);
        return;
    }
});

// 4. Update an event
app.put('/api/v1/events/:eId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.eId)) {
            if (events[i].bookings.length == 0) {
                validation = logic.eventUpdateValidation(req.body);
                if (validation) {
                    res.status(400).json({ message: errorMessages[validation] });
                } else {
                    events[i].name = req.body.name;
                    events[i].description = req.body.description;
                    events[i].location = req.body.location;
                    events[i].capacity = Number(req.body.capacity);
                    events[i].startDate = new Date(req.body.startDate*1000).toString();
                    events[i].endDate = new Date(req.body.endDate*1000).toString();
                    res.status(200).json(events[i]);
                    return;
                }
            }
            else {
                res.status(400).json({ message: errorMessages[26] });
                return;
            }
        }
    }
    res.status(404).json({ message: 'event not found' });
    return;
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
                res.status(400).json({ message: errorMessages[27] });
                return;
            }
        }
    }
    res.status(404).json({ message: 'event not found' });
    return;
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
    return;
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
    return;
});

// Function that finds how many spots are taken
function getReservedSpots(event) {
    let reserved = 0
    for (let i = 0; i < bookings.length; i++) {
        if (i in event.bookings) {
            reserved += bookings[i].spots
        }
    }
    return reserved;
};

// 3. Create a new booking
app.post('/api/v1/events/:eId/bookings', (req, res) => {
    let validation = logic.bookingValidation(req.body);
    if (validation) {
        res.status(400).json({ message: errorMessages[validation] });
    } else {
        let newBooking = Object(
            {
                id: logic.getNewBookingId(),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                spots: Number(req.body.spots),
                email: req.body.email,
                tel: Number(req.body.tel)
            }
        );
        let bookingEvent = logic.findEventWithID(events, req.params.eId);
        if (bookingEvent !== null) {
            let reservedSpots = getReservedSpots(bookingEvent);
            console.log("reserved", reservedSpots)
            let totalSpots = reservedSpots + newBooking.spots;
            console.log("total", totalSpots)
            if (totalSpots <= bookingEvent.capacity) {
                bookingEvent.bookings.push(newBooking.id);
                bookings.push(newBooking)
                res.status(201).json(newBooking);
                return;
            }
            res.status(404).json({ message: 'spots cannot be larger than the remaining capacity of an event.' });
            return;
        }
        res.status(404).json({ message: 'event not found.' });
        return;
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
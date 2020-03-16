// Project 03/index.js
const logic = require('./logic');
const express = require('express');
const app = express();
const url = require('body-parser');
const port = '3000';

/* ============================================================================================ */
/* Setup                                                                                        */
/* ============================================================================================ */

app.use(url.json());
app.listen(port, () => console.log(`Weather app listening on port ${port}!`));

var events = [];
var observations = [];
var errorMessages = [
    'All good.',
    'The request body is undefined.',
    'Description "description": is missing',
    'Latitude "lat": must be in range [-90, 90].',
    'Longitude "lon": must be in range [-180, 180].',
    'Tempeture "temp": must be a number',
    'Wind speed "windSpeed": must be a non negative number.',
    'Wind direction "windDir": must be lowercase cardinal direction',
    'Precipitation "prec": must not be negative.',
    'Humidity "hum": musts be in range [0, 100]'
];

/* ============================================================================================ */
/* GET requests                                                                                 */
/* ============================================================================================ */

/* 
    s1. Read all stations
        Returns an array of all stations. For each station, 
        only the description and the id is included in theresponse. 
*/
app.get('/api/v1/events', (req, res) => {
    let shortStations = [];
    events.forEach(station => {
        shortEvents.push({ id: event.id, description: event.description });
    });
    res.status(200).json(shortEvents);
});


/* 
    s2. Read an individual station 
        Returns all attributes of a specified station. 
*/
app.get('/api/v1/events/:sId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.sId)) {
            res.status(200).json(events[i]);
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});


/*  
    o1. Read all observations for a station
        Returns an array of all observations (with all attributes) for a specified station.
*/
app.get('/api/v1/events/:sId/bookings', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.sId)) {
            let obs = [];
            for (let j = 0; j < bookings.length; j++) {
                events[i].bookings.forEach(oId => {
                    if (Number(bookings[j].id) === Number(oId)) {
                        obs.push(bookings[j]);
                    }
                });
            }
            res.status(200).json(obs);
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});


/*  
    o2. Read an individual observation
        Returns all attributes of a specified observation (for a station).
*/
app.get('/api/v1/events/:sId/bookings/:oId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.sId)) {
            for (let j = 0; j < bookings.length; j++) {
                if (Number(bookings[j].id) === Number(req.params.oId)) {
                    res.status(200).json(
                        {
                            date: bookings[j].date,
                            temp: bookings[j].temp,
                            windSpeed: bookings[j].windSpeed,
                            windDir: bookings[j].windDir,
                            prec: bookings[j].prec,
                            hum: bookings[j].hum
                        }
                    );
                    return;
                }
            }
            res.status(404).json({ message: 'booking not found.' });
            return;
        }
    }
    res.status(404).json({ message: 'event not found.' });
});

/* ============================================================================================ */
/* POST requests                                                                                */
/* ============================================================================================ */

/*  
    s3. Create a new station
        Creates a new station. The endpoint expects all attributes apart 
        from the id in the request body. The id shall be auto-generated. 
        The request, if successful, shall return the new station 
        (all attributes, including id).
*/
app.post('/api/v1/events', (req, res) => {
    let validationCode = logic.eventValidation(req.body);
    if (validationCode) {
        res.status(400).json({ message: errorMessages[validationCode] });
    } else {
        let newEvent = Object(
            {
                id: logic.getNewEventId(),
                description: req.body.description,
                lon: Number(req.body.lon),
                lat: Number(req.body.lat),
                bookings: []
            }
        );
        events.push(newEvent);
        res.status(201).json(newEvent);
    }
});


/*  
    o3. Create a new observation
        Creates a new observation for a specified station. The endpoint expects all attributes 
        apart from the id and the date in the request body. The id (unique, non-negative number) 
        and the date (current date) shall be auto-generated. The request, if successful, 
        shall return the new observation (all attributes, including id and date).
*/
app.post('/api/v1/events/:sId/bookings', (req, res) => {
    let validationCode = logic.bookingValidation(req.body);
    if (validationCode) {
        res.status(400).json({ message: errorMessages[validationCode] });
    } else {
        let newBooking = Object(
            {
                id: logic.getNewBookingId(),
                date: new Date().getTime(),
                temp: Number(req.body.temp),
                windSpeed: Number(req.body.windSpeed),
                windDir: req.body.windDir,
                prec: Number(req.body.prec),
                hum: Number(req.body.hum)
            }
        );
        let parentEvent = logic.findEventWithID(events, req.params.sId);
        if (parentEvent !== null) {
            parentEvent.bookings.push(newBooking.id);
            bookings.push(newBooking)
            res.status(201).json(newBooking);
            return;
        }
        res.status(404).json({ message: 'event not found.' });
    }
});

/* ============================================================================================ */
/* PUT requests                                                                                 */
/* ============================================================================================ */

/*  
    s5. Update a station
        (Completely) Updates an existing station. The updated data is expected in the request body (excluding the id). 
        The request, if successful, returns all updated attributes of the station.
*/
app.put('/api/v1/events/:sId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.sId)) {
            validationCode = logic.eventValidation(req.body);
            if (validationCode) {
                res.status(400).json({ message: errorMessages[validationCode] });
            } else {
                events[i].description = req.body.description;
                events[i].lat = req.body.lat;
                events[i].lon = req.body.lon;
                res.status(200).json(events[i]);
                return;
            }
        }
    }
    res.status(404).json({ message: 'event not found' });
});


/* ============================================================================================ */
/* DELETE requests                                                                              */
/* ============================================================================================ */

/*  
   s6. Delete all stations
        Deletes all existing stations. The request also deletes all observations for all existing stations. The
        request, if successful, returns all deleted stations (all attributes), as well as their observations (as a
        part of the observations attribute).
*/
app.delete('/api/v1/events', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        let obs = [];
        for (let j = 0; j < bookings.length; j++) {
            events[i].bookings.forEach(oId => {
                if (Number(bookings[j].id) === Number(oId)) {
                    obs.push(bookings[j]);
                }
            });
        }
        events[i].bookings = obs;
    }
    res.status(200).json({ events: events });
    events = [];
    bookings = [];
});


/*  
    s4. Delete a station
        Deletes an existing station. The request also deletes all observations for the given station. 
        The request, if successful, returns all attributes of the deleted station 
        (including all observations in the observations attribute).
*/
app.delete('/api/v1/events/:sId', (req, res) => {
    let obs = [];
    for (let i = 0; i < events.length; i++) {
        if (Number(events[i].id) === Number(req.params.sId)) {
            for (let j = 0; j < bookings.length; j++) {
                events[i].bookings.forEach(oId => {
                    if (Number(bookings[j].id) === Number(oId)) {
                        obs.push(bookings.splice(j--, 1));
                    }
                });
            }
            res.status(200).json({ events: events.splice(i, 1), bookings: obs });
            return;
        }
    }
    res.status(404).json({ message: 'event not found' });
});


/*  
    o5. Delete all observations for a station
        Deletes all existing observations for a specified station. The request, 
        if successful, returns all deleted observations (all attributes).
*/
app.delete('/api/v1/stations/:sId/observations/', (req, res) => {
    let obs = [];
    for (let i = 0; i < stations.length; i++) {
        if (Number(stations[i].id) === Number(req.params.sId)) {
            for (let j = 0; j < observations.length; j++) {
                for (let k = 0; k < stations[i].observations.length; k++) {
                    if (Number(observations[j].id) === Number(stations[i].observations[k])) {
                        obs.push(observations.splice(j--, 1));
                    }
                }
            }
            stations[i].observations = [];
            res.status(200).json({ observations: obs });
            return;
        }
    }
    res.status(404).json({ message: 'station not found.' });
});


/*  
    o4. Delete an observation
        Deletes an existing observation for a specified station. The request, 
        if successful, returns all attributes of the deleted observations[j].
*/
app.delete('/api/v1/stations/:sId/observations/:oId', (req, res) => {
    for (let i = 0; i < stations.length; i++) {
        if (Number(stations[i].id) === Number(req.params.sId)) {
            for (let j = 0; j < observations.length; j++) {
                if (Number(observations[j].id) === Number(req.params.oId)) {
                    for (let k = 0; k < stations[i].observations.length; k++) {
                        if (Number(stations[i].observations[k]) === Number(req.params.oId)) {
                            stations[i].observations.splice(k, 1);
                            res.status(202).json({ observations: observations.splice(j, 1) });
                            return;
                        }
                    }
                }
            }
            res.status(404).json({ message: 'observation not found.' });
            return;
        }
    }
    res.status(404).json({ message: 'station not found.' });
});

/* ============================================================================================ */
/* Default: Not supported                                                                       */
/* ============================================================================================ */

app.use('*', (req, res) => {
    res.status(405).json({ message: 'Operation not supported.' });
});
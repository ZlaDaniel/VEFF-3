var eventCount = 0;
var bookingCount = 0;

exports.eventValidation = function(ob) {
    if(ob === undefined) {
        return 1;
    }
    if(ob.name === undefined) {
        return 2;  
    }
    if(ob.capacity === undefined) {
        return 3;
    }
    if(ob.startDate === undefined) {
        return 4;
    }
    if(ob.endDate === undefined) {
        return 5;
    }
    if(typeof ob.capacity === 'string'){
        return 12;
    }
    if(typeof ob.startDate === 'string'){
        return 13;
    }
    if(typeof ob.endDate === 'string'){
        return 14;
    }
    if(Number.isNaN(Number(ob.capacity)) == NaN) {
        return 17;  
    }
    if(Number.isNaN(Number(ob.startDate)) == NaN) {
        return 18;    
    }
    if(Number.isNaN(Number(ob.endDate)) == NaN) {
        return 19;    
    }
    if(Number(ob.capacity) < 0) {
        return 22;
    }
    if(new Date(ob.startDate*1000) <= new Date()) {
        return 23;
    }
    if(new Date(ob.endDate*1000) <= new Date(ob.startDate*1000)) {
        return 24;
    }
    return 0
}

exports.eventUpdateValidation = function(ob) {
    let validation = this.eventValidation(ob);
    if (validation === 0) {
        if(ob.description === undefined) {
            return 6;  
        }
        if(ob.location === undefined) {
            return 7;  
        }
        return 0
    }
    return validation
}

exports.bookingValidation = function(ob){
    if(ob === undefined) {
        return 1;
    }
    if(ob.firstName === undefined) {
        return 8;  
    }
    if(ob.lastName === undefined) {
        return 9;  
    }
    if(ob.spots === undefined) {
        return 10;
    }
    if(ob.tel === undefined && ob.email === undefined) {
        return 11; 
    }
    if(typeof ob.spots === 'string'){
        return 15;
    }
    if(typeof ob.tel === 'string'){
        return 16;
    }
    if(Number.isNaN(Number(ob.spots)) == NaN) {
        return 20;  
    } 
    if(Number.isNaN(Number(ob.tel)) == NaN) {
        return 21;  
    }
    if(Number(ob.spots) <= 0) {
        return 25;
    }
    return 0;
}

exports.getNewEventId = function () {
    return eventCount++;
}

exports.getNewBookingId = function() {
    return bookingCount++;
}

exports.findEventWithID = function(events, id) {
    for (let i = 0; i < events.length; i++) {
        if (events[i].id == id) {
            return events[i];
        }
    }
    return null;
}
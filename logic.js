var eventCount = 0;
var bookingCount = 0;

exports.eventValidation = function(ob) {
    if(ob === undefined) {
        return 1;
    }
    if(ob.name === undefined) {
        return 2;  
    }
    if(ob.capacity === undefined || Number.isNaN(Number(ob.capacity)) == NaN || Number(ob.capacity) < 0 ) {
        return 3;    
    }
    if(ob.startDate === undefined) {
        return 4;    
    }
    if(eval(ob.startDate) <= Date.now()) {
        return 5;
    }
    if(ob.endDate === undefined) {
        return 6;    
    }
    if(eval(ob.endDate) <= eval(ob.startDate)) {
        return 7;
    }
    return 0
}

exports.eventUpdateValidation = function(ob) {
    if(ob === undefined) {
        return 1;
    }
    if(ob.name === undefined) {
        return 2;  
    }
    if(ob.capacity === undefined || Number.isNaN(Number(ob.capacity)) == NaN || Number(ob.capacity) < 0 ) {
        return 3;    
    }
    if(ob.startDate === undefined) {
        return 4;    
    }
    if(eval(ob.startDate) <= Date.now()) {
        return 5;
    }
    if(ob.endDate === undefined) {
        return 6;    
    }
    if(eval(ob.endDate) <= eval(ob.startDate)) {
        return 7;
    }
    if(ob.description === undefined) {
        return 8;  
    }
    if(ob.location === undefined) {
        return 9;  
    }
    return 0
}

exports.bookingValidation = function(ob){
    if(ob === undefined) {
        return 1;
    }
    if(ob.firstName === undefined) {
        return 10;  
    }
    if(ob.lastName === undefined) {
        return 11;  
    }
    // (e) Spots cannot be larger than the remaining capacity of an event.
    // þetta vantar
    if(ob.spots === undefined || Number.isNaN(Number(ob.spots)) || Number(ob.spots) < 0) {
        return 12;  
    }
    if(ob.tel === undefined && ob.email === undefined) {
        return 14; 
    }
    if(ob.email === undefined && Number.isNaN(Number(ob.tel))) {
        return 13;
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
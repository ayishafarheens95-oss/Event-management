const express = require('express');
const fs = require('fs');
const path = require('path');
const { cache } = require('react');

const app = express();
const PORT = process.env.PORT || 3000;
const eventsFilePath = path.join(__dirname, 'Data', 'events.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureEventsFileExists() {
    try{
        if (!fs.existsSync(eventsFilePath)) {
            fs.writeFileSync(eventsFilePath, JSON.stringify([], null, 2), 'utf-8');
    }
    } catch (err) {
        console.error('Error ensuring events file exists:', err);
}

}

function loadEvents() {
    ensureEventsFileExists();
    const raw = fs.readFileSync(eventsFilePath, 'utf-8');
    return JSON.parse(raw);
}

function saveEvents(events) {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf-8');
}


app.get('/api/events', (req, res) => {
    const events = loadEvents();
    res.json(events);
});

app.put('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const updatedEvent = req.body;
    const events = loadEvents();
    const index = events.findIndex(event => event.id === eventId); 
    if (index !== -1) {
        events[index] = updatedEvent;
        saveEvents(events);
        res.json({ message: 'Event updated successfully' });
    } else {
        res.status(404).json({ message: 'Event not found' });
    }
}); 

app.delete('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const events = loadEvents();
    const filteredEvents = events.filter(event => event.id !== eventId);
    if (filteredEvents.length !== events.length) {
        saveEvents(filteredEvents);
        res.json({ message: 'Event deleted successfully' });
    }
    else {
        res.status(404).json({ message: 'Event not found' });
    }
});

app.post('/api/events', (req, res) =>{
    try{
        const newEvent = req.body;
        const events = loadEvents();
        events.push(newEvent);
        saveEvents(events);
        res.status(201).json({ message: 'Event created successfully' });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ message: 'Internal server error' });

    }
}


);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
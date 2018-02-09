var express = require('express'),
    app = express(),
    https = require('https'),
    socketIo = require('socket.io'),
    serverPort = 8000,
    eventData = [],
    LINQ = require('node-linq').LINQ,
    eventSockets = [],
    path = require('path'),
    fs = require('fs');

var options = {
    key: fs.readFileSync(path.join(__dirname, 'keys/kazastream.key')),
    cert: fs.readFileSync(path.join(__dirname, 'keys/542cc3f680793cdf.crt')),
    ca: [fs.readFileSync('keys/1.crt'), fs.readFileSync('keys/2.crt'), fs.readFileSync('keys/3.crt')]
};

var server = https.createServer(options, app).listen(serverPort);;
var io = socketIo.listen(server);
app.use(express.static(__dirname + '/static'));
console.log("Server running on localhost:" + serverPort);

io.on('connection', function (socket) {
    var currentEvent = socket.handshake.query.Event,
        eventLines = getCurrentEventLines(currentEvent),
        currentClients = getClientsByEvent(currentEvent);

    pushClientsByEvent(currentEvent, socket);
    for (var i in eventLines) {
        socket.emit('draw_line', {
            line: eventLines[i]
        });
    }
    socket.on('draw_line', function (data) {
        var drawEvent = data.eventId,
            clients = getClientsByEvent(drawEvent);

        var emit = new LINQ(clients).All(function (item) {
            item.emit('draw_line', {
                line: data.line
            });
        });

        pushLinesByEvent(data.eventId, data.line);
    });
});

function pushClientsByEvent(eventId, socket) {
    var currentSocket = getClientsByEvent(eventId);
    if (currentSocket != null && currentSocket.length > 0) {
        currentSocket.push(socket);
    } else {
        var n = [];
        n.push(socket);
        eventSockets.push({
            Event: eventId,
            Sockets: n
        });
    }
}

function getClientsByEvent(eventId) {
    if (eventSockets.length === 0)
        return null;
    else {
        for (var i = 0; i < eventSockets.length; i++) {
            if (eventSockets[i].Event === eventId) {
                return eventSockets[i].Sockets;
            }
        }
    }
    return null;
}

function pushLinesByEvent(eventId, data) {
    var currentLines = getCurrentEventLines(eventId);
    if (currentLines != null && currentLines.length > 0) {
        currentLines.push(data);
    } else {
        var n = [];
        n.push(data);
        eventData.push({
            Event: eventId,
            eventLines: n
        });
    }
}

function getLinesByUserAndEvent(eventId, userId) {
    //TODO:if (undo typing by user)
}

function getCurrentEventLines(eventId) {
    if (eventData.length === 0)
        return null;
    else {
        for (var i = 0; i < eventData.length; i++) {
            if (eventData[i].Event === eventId) {
                return eventData[i].eventLines;
            }
        }
    }
    return null;
}
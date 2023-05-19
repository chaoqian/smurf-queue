const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Queue data stored in memory (replace with a database in production)
let def_mainQueue = [];
let def_subQueue = [];
let def_shiftToMain = [];
let def_shiftToSub = [];
let mid_mainQueue = [];
let mid_subQueue = [];
let mid_shiftToMain = [];
let mid_shiftToSub = [];
let for_mainQueue = [];
let for_subQueue = [];
let for_shiftToMain = [];
let for_shiftToSub = [];
let def_mainQueueSize = 3;
let def_subQueueSize = 0;
let mid_mainQueueSize = 3;
let mid_subQueueSize = 0;
let for_mainQueueSize = 3;
let for_subQueueSize = 0;


// Helper
let startTimerClicked = false;

// Countdown timer
let countdownTimer = null;
let defaultTimerSeconds = 600;
let remainingSeconds = defaultTimerSeconds; // 10 minutes in seconds

function shiftQueues() {
    var subQueueSize = def_subQueue.length;
    var mainQueueSize = def_mainQueue.length;
    def_shiftToMain = def_subQueue.splice(0, subQueueSize);
    def_mainQueue = def_shiftToMain.concat(def_mainQueue);
    def_shiftToSub = def_mainQueue.splice(mainQueueSize, subQueueSize);
    def_subQueue = def_shiftToSub.concat(def_subQueue);
    def_shiftToMain = def_subQueue.slice();
    def_shiftToSub = def_subQueue.length > 0 ? def_mainQueue.slice(-1 * def_subQueue.length) : [];


    subQueueSize = mid_subQueue.length;
    mainQueueSize = mid_mainQueue.length;
    mid_shiftToMain = mid_subQueue.splice(0, subQueueSize);
    mid_mainQueue = mid_shiftToMain.concat(mid_mainQueue);
    mid_shiftToSub = mid_mainQueue.splice(mainQueueSize, subQueueSize);
    mid_subQueue = mid_shiftToSub.concat(mid_subQueue);
    mid_shiftToMain = mid_subQueue.slice();
    mid_shiftToSub = mid_subQueue.length > 0 ? mid_mainQueue.slice(-1 * mid_subQueue.length) : [];

    subQueueSize = for_subQueue.length;
    mainQueueSize = for_mainQueue.length;
    for_shiftToMain = for_subQueue.splice(0, subQueueSize);
    for_mainQueue = for_shiftToMain.concat(for_mainQueue);
    for_shiftToSub = for_mainQueue.splice(mainQueueSize, subQueueSize);
    for_subQueue = for_shiftToSub.concat(for_subQueue);
    for_shiftToMain = for_subQueue.slice();
    for_shiftToSub = for_subQueue.length > 0 ? for_mainQueue.slice(-1 * for_subQueue.length) : [];
}

function getData() {
    return {
        def_mainQueue, def_subQueue, def_shiftToMain, def_shiftToSub,
        mid_mainQueue, mid_subQueue, mid_shiftToMain, mid_shiftToSub,
        for_mainQueue, for_subQueue, for_shiftToMain, for_shiftToSub
    };
}

function init() {
    initQueue('Def');
    initQueue('Mid');
    initQueue('For');
}

function initQueue(type) {
    switch (type) {
        case 'Def':
            // clear and init queue
            resetAndInitQueueState(def_mainQueue, def_mainQueueSize, type, 0);
            resetAndInitQueueState(def_subQueue, def_subQueueSize, type, def_mainQueueSize);
            def_shiftToMain = def_subQueue.slice();
            def_shiftToSub = def_subQueue.length > 0 ? def_mainQueue.slice(-1 * def_subQueue.length) : [];
            break;
        case 'Mid':
            // clear and init queue
            resetAndInitQueueState(mid_mainQueue, mid_mainQueueSize, type, 0);
            resetAndInitQueueState(mid_subQueue, mid_subQueueSize, type, mid_mainQueueSize);
            mid_shiftToMain = mid_subQueue.slice();
            mid_shiftToSub = mid_subQueue.length > 0 ? mid_mainQueue.slice(-1 * mid_subQueue.length) : [];
            break;
        case 'For':
            // clear and init queue
            resetAndInitQueueState(for_mainQueue, for_mainQueueSize, type, 0);
            resetAndInitQueueState(for_subQueue, for_subQueueSize, type, for_mainQueueSize);
            for_shiftToMain = for_subQueue.slice();
            for_shiftToSub = for_subQueue.length > 0 ? for_mainQueue.slice(-1 * for_subQueue.length) : [];
            break;
        default:
            break;
    }
}

function resetAndInitQueueState(queue, size, prefix, startIndex) {
    queue.length = 0;
    for (let i = startIndex + size - 1; i >= startIndex; i--) {
        var post_fix = i + 1;
        queue.push(prefix + " " + post_fix);
    }
}

init();
// Socket.io event handlers
io.on('connection', (socket) => {
    // Send the initial queue data to the client
    socket.emit('queueData', getData());

    // Start the countdown timer
    function startTimer() {
        startTimerClicked = true;
        countdownTimer = setInterval(() => {
            // Notify all connected clients about the updated countdown
            io.emit('countdown', remainingSeconds);
            remainingSeconds--;
            if (remainingSeconds < 0) {
                // Perform the queue shifting logic here
                shiftQueues()

                // Notify all connected clients about the updated queue data
                io.emit('queueData', getData());
                clearInterval(countdownTimer);
                remainingSeconds = defaultTimerSeconds;
                startTimerClicked = false;
            }
        }, 1000); // 1 second
    }

    // Handle reset timer event from the client
    socket.on('resetTimer', () => {
        // Stop the current timer
        clearInterval(countdownTimer);

        // Reset the timer
        remainingSeconds = defaultTimerSeconds; // 10 minutes in seconds
        io.emit('countdown', remainingSeconds);
    });

    // Handle start timer event from the client
    socket.on('startTimer', () => {
        if (startTimerClicked) {
            return;
        }
        startTimer()
    });

    // Handle queueDataRequest event from the client
    socket.on('queueDataRequest', () => {
        // Send the initial queue data to the client
        socket.emit('queueData', getData());
    });

    // Handle updateSubQueueSize event from the client
    socket.on('updateSubQueueSize', (size, type) => {
        // set sub queue size
        switch (type) {
            case 'Def':
                def_subQueueSize = size;
                initQueue('Def');
                socket.emit('queueData', getData());
                break;
            case 'Mid':
                mid_subQueueSize = size;
                initQueue('Mid');
                socket.emit('queueData', getData());
                break;
            case 'For':
                for_subQueueSize = size;
                initQueue('For');
                socket.emit('queueData', getData());
                break;
            default:
                break;
        }
    });

    // Handle updateMainQueueSize event from the client
    socket.on('updateMainQueueSize', (size, type) => {
        // set sub queue size
        switch (type) {
            case 'Def':
                def_mainQueueSize = size;
                initQueue('Def');
                socket.emit('queueData', getData());
                break;
            case 'Mid':
                mid_mainQueueSize = size;
                initQueue('Mid');
                socket.emit('queueData', getData());
                break;
            case 'For':
                for_mainQueueSize = size;
                initQueue('For');
                socket.emit('queueData', getData());
                break;
            default:
                break;
        }
    });
});

// Serve the client-side JavaScript file
app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});

// Serve the client-side JavaScript file
app.get('/manager-script.js', (req, res) => {
    res.sendFile(__dirname + '/manager-script.js');
});

// Serve the client-side CSS file
app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});

// Serve the client-side HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve the client-side HTML file
app.get('/manager', (req, res) => {
    res.sendFile(__dirname + '/manager.html');
});

// Start the server
const port = process.env.PORT || 3000; // Use the port specified by the environment variable, or fallback to port 3000
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

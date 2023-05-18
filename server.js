const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Queue data stored in memory (replace with a database in production)
let mainQueue = ['Element 1', 'Element 2', 'Element 3'];
let subQueue = ['Element A', 'Element B'];
let mainQueueSize = 3;
// Countdown timer
let countdownTimer = null;
let defaultTimerSeconds = 5;
let remainingSeconds = defaultTimerSeconds; // 10 minutes in seconds

function shiftQueues() {
    var subQueueSize = subQueue.length
    var shiftedElements = subQueue.splice(0, subQueue.length);
    mainQueue = shiftedElements.concat(mainQueue);
    excessElements = mainQueue.splice(mainQueueSize, subQueueSize);
    subQueue = excessElements.concat(subQueue);
}

// Socket.io event handlers
io.on('connection', (socket) => {
    // Send the initial queue data to the client
    socket.emit('queueData', { mainQueue, subQueue });

    // Start the countdown timer
    function startTimer() {
        countdownTimer = setInterval(() => {
            // Notify all connected clients about the updated countdown
            io.emit('countdown', remainingSeconds);
            remainingSeconds--;
            if (remainingSeconds < 0) {
                // Perform the queue shifting logic here
                shiftQueues()

                // Notify all connected clients about the updated queue data
                io.emit('queueData', { mainQueue, subQueue });
                clearInterval(countdownTimer);
                remainingSeconds = defaultTimerSeconds;
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
        startTimer()
    });

    // Handle queueDataRequest event from the client
    socket.on('queueDataRequest', () => {
        // Send the initial queue data to the client
        socket.emit('queueData', { mainQueue, subQueue });
    });

});

// Serve the client-side JavaScript file
app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});

// Serve the client-side CSS file
app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});

// Serve the client-side HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
const port = process.env.PORT || 3000; // Use the port specified by the environment variable, or fallback to port 3000
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

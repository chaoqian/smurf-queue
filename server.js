const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const ShiftType = {
    ONE_BY_ONE: 'one by one',
    SUB_AT_ONCE: 'sub all at once'
};

// Queue data stored in memory (replace with a database in production)
class PositionQueues {
    mainQueue;
    subQueue;
    shiftToMain;
    shiftToSub;
    mainQueueSize;
    subQueueSize;

    constructor() {
        this.mainQueue = [];
        this.subQueue = [];
        this.shiftToMain = [];
        this.shiftToSub = [];
        this.mainQueueSize = 3;
        this.subQueueSize = 0;
    }
}

class Timer {
    startTimerClicked;
    countdownTimer;
    defaultTimerSeconds;
    remainingSeconds;

    constructor() {
        this.startTimerClicked = false;
        this.countdownTimer = null;
        this.defaultTimerSeconds = 600;
        this.remainingSeconds = 600;
    }
}

let def_queues = new PositionQueues();
let mid_queues = new PositionQueues();
let for_queues = new PositionQueues();

let def_timer = new Timer();
let mid_timer = new Timer();
let for_timer = new Timer();


function getTimer(prefix) {
    var timerInstance = null;
    switch (prefix) {
        case 'def':
            timerInstance = def_timer;
            break;
        case 'mid':
            timerInstance = mid_timer;
            break;
        case 'for':
            timerInstance = for_timer;
            break;
        default:
            timerInstance = def_timer;
            break;
    }
    return timerInstance;
}

function getPositionQueueSingleton(prefix) {
    switch (prefix) {
        case 'def':
        case 'Def':
            return def_queues;
        case 'mid':
        case 'Mid':
            return mid_queues;
        case 'for':
        case 'For':
            return for_queues;
        default:
            break;
    }
    return null;
}

function getData() {
    // readonly
    var def_mainQueue = def_queues.mainQueue;
    var def_subQueue = def_queues.subQueue;
    var def_shiftToMain = def_queues.shiftToMain;
    var def_shiftToSub = def_queues.shiftToSub;

    var mid_mainQueue = mid_queues.mainQueue;
    var mid_subQueue = mid_queues.subQueue;
    var mid_shiftToMain = mid_queues.shiftToMain;
    var mid_shiftToSub = mid_queues.shiftToSub;

    var for_mainQueue = for_queues.mainQueue;
    var for_subQueue = for_queues.subQueue;
    var for_shiftToMain = for_queues.shiftToMain;
    var for_shiftToSub = for_queues.shiftToSub;

    return {
        def_mainQueue, def_subQueue, def_shiftToMain, def_shiftToSub,
        mid_mainQueue, mid_subQueue, mid_shiftToMain, mid_shiftToSub,
        for_mainQueue, for_subQueue, for_shiftToMain, for_shiftToSub
    };
}

function setShiftQueues(prefix, shiftType = ShiftType.SUB_AT_ONCE) {
    var positionQueue = getPositionQueueSingleton(prefix);
    var mainQueue = positionQueue.mainQueue;
    var subQueue = positionQueue.subQueue;
    if (shiftType == ShiftType.SUB_AT_ONCE) {
        positionQueue.shiftToMain = subQueue.slice();
        positionQueue.shiftToSub = subQueue.length > 0 ? mainQueue.slice(-1 * subQueue.length) : [];
    }
    else {
        positionQueue.shiftToMain = subQueue.length > 0 ? subQueue.slice(-1) : [];
        positionQueue.shiftToSub = subQueue.length > 0 ? mainQueue.slice(-1) : [];
    }
}

function shiftQueues(prefix, shiftType = ShiftType.SUB_AT_ONCE) {
    var queueInstances = getPositionQueueSingleton(prefix);
    var subQueueSize = queueInstances.subQueue.length;
    var mainQueueSize = queueInstances.mainQueue.length;
    var toMoveToMain = null;
    var toMoveToSub = null;

    if (shiftType == ShiftType.SUB_AT_ONCE) {
        toMoveToMain = queueInstances.subQueue.splice(0, subQueueSize);
        queueInstances.mainQueue = toMoveToMain.concat(queueInstances.mainQueue);
        toMoveToSub = queueInstances.mainQueue.splice(mainQueueSize, subQueueSize);
        queueInstances.subQueue = toMoveToSub.concat(queueInstances.subQueue);
    }
    else {
        if (subQueueSize > 0) {
            toMoveToMain = queueInstances.subQueue.splice(subQueueSize - 2, 1);
            queueInstances.mainQueue = toMoveToMain.concat(queueInstances.mainQueue);
            toMoveToSub = queueInstances.mainQueue.splice(mainQueueSize, subQueueSize);
            queueInstances.subQueue = toMoveToSub.concat(queueInstances.subQueue);
        }
    }
    setShiftQueues(prefix, shiftType);
}

function init() {
    initQueue('Def');
    initQueue('Mid');
    initQueue('For');
}

function initQueue(prefix) {
    var positionQueue = getPositionQueueSingleton(prefix);
    resetAndInitQueueState(positionQueue.mainQueue, positionQueue.mainQueueSize, prefix, 0);
    resetAndInitQueueState(positionQueue.subQueue, positionQueue.subQueueSize, prefix, positionQueue.mainQueueSize);
    setShiftQueues(prefix);
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
    function startTimer(prefix) {
        var timerInstance = getTimer(prefix);
        timerInstance.startTimerClicked = true;
        timerInstance.countdownTimer = setInterval(() => {
            // Notify all connected clients about the updated countdown
            io.emit(prefix + '-' + 'countdown', timerInstance.remainingSeconds);
            timerInstance.remainingSeconds--;
            if (timerInstance.remainingSeconds < 0) {
                // Perform the queue shifting logic here
                shiftQueues(prefix)

                // Notify all connected clients about the updated queue data
                io.emit('queueData', getData());
                clearInterval(timerInstance.countdownTimer);
                timerInstance.remainingSeconds = timerInstance.defaultTimerSeconds;
                timerInstance.startTimerClicked = false;
            }
        }, 1000); // 1 second
    }

    // Handle reset timer event from the client
    socket.on('resetTimer', (prefix) => {
        var timerInstance = getTimer(prefix);
        // Stop the current timer
        clearInterval(timerInstance.countdownTimer);

        // Reset the timer
        timerInstance.remainingSeconds = timerInstance.defaultTimerSeconds; // 10 minutes in seconds
        io.emit(prefix + '-' + 'countdown', timerInstance.remainingSeconds);
        timerInstance.startTimerClicked = false;
    });

    // Handle start timer event from the client
    socket.on('startTimer', (prefix) => {
        var timerInstance = getTimer(prefix);
        if (timerInstance.startTimerClicked) {
            return;
        }
        startTimer(prefix)
    });

    // Handle force update event from the client
    socket.on('forceUpdate', (queueData, prefix) => {
        var subQueueData = queueData.subQueue;
        var mainQueueData = queueData.mainQueue;
        var currentQueueInstances = getPositionQueueSingleton(prefix);

        // force update
        currentQueueInstances.subQueue = subQueueData;
        currentQueueInstances.mainQueue = mainQueueData;
        setShiftQueues(prefix);

        // update display
        socket.emit('queueData', getData());
    });

    // Handle queueDataRequest event from the client
    socket.on('queueDataRequest', () => {
        // Send the initial queue data to the client
        socket.emit('queueData', getData());
    });

    // Handle updateSubQueueSize event from the client
    socket.on('updateSubQueueSize', (size, prefix) => {
        var positionQueueInstance = getPositionQueueSingleton(prefix);
        positionQueueInstance.subQueueSize = size;
        initQueue(prefix);
        socket.emit('queueData', getData());
    });

    // Handle updateMainQueueSize event from the client
    socket.on('updateMainQueueSize', (size, prefix) => {
        var positionQueueInstance = getPositionQueueSingleton(prefix);
        positionQueueInstance.mainQueueSize = size;
        initQueue(prefix);
        socket.emit('queueData', getData());
    });

    // Handle updateSubQueueSize event from the client
    socket.on('updateDefaultTimeoutSeconds', (defaultTimeoutSeconds, prefix) => {
        var timerInstance = getTimer(prefix);
        timerInstance.defaultTimerSeconds = defaultTimeoutSeconds;

        // Stop the current timer
        clearInterval(timerInstance.countdownTimer);

        // Reset the timer
        timerInstance.remainingSeconds = defaultTimeoutSeconds; // 10 minutes in seconds
        io.emit(prefix + '-' + 'countdown', timerInstance.remainingSeconds);
        timerInstance.startTimerClicked = false;
    });
});

// Serve the client-side JavaScript file
app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});

app.get('/drag-drop-script.js', (req, res) => {
    res.sendFile(__dirname + '/drag-drop-script.js');
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

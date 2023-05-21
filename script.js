const socket = io();

function displayQueues(queueData) {
  // Defender
  document.getElementById('mainQueueElements-D').innerHTML = queueData.def_mainQueue.map(createQueueElement).join('');
  document.getElementById('subQueueElements-D').innerHTML = queueData.def_subQueue.map(createQueueElement).join('');
  // Display elements shifting from sub queue to main queue
  displayShiftToMainQueueElements(queueData.def_shiftToMain, 'D');
  // Display elements shifting from main queue to sub queue
  displayShiftToSubQueueElements(queueData.def_shiftToSub, 'D');

  // Midfielder
  document.getElementById('mainQueueElements-M').innerHTML = queueData.mid_mainQueue.map(createQueueElement).join('');
  document.getElementById('subQueueElements-M').innerHTML = queueData.mid_subQueue.map(createQueueElement).join('');
  // Display elements shifting from sub queue to main queue
  displayShiftToMainQueueElements(queueData.mid_shiftToMain, 'M');
  // Display elements shifting from main queue to sub queue
  displayShiftToSubQueueElements(queueData.mid_shiftToSub, 'M');

  // Forward
  document.getElementById('mainQueueElements-F').innerHTML = queueData.for_mainQueue.map(createQueueElement).join('');
  document.getElementById('subQueueElements-F').innerHTML = queueData.for_subQueue.map(createQueueElement).join('');
  // Display elements shifting from sub queue to main queue
  displayShiftToMainQueueElements(queueData.for_shiftToMain, 'F');
  // Display elements shifting from main queue to sub queue
  displayShiftToSubQueueElements(queueData.for_shiftToSub, 'F');
}

function createQueueElement(element) {
  var id_string = element.replace(/\s+/g, "-");
  return '<div class="queue-element draggable" draggable="true" id="' + id_string + '">' + element + '</div>';
}

function displayCountdown(seconds, prefix) {
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;

  var countdown = document.getElementById(prefix + '-' + 'countdown');
  countdown.innerText = minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
}

// Function to display elements shifting from sub queue to main queue
function displayShiftToMainQueueElements(elements, position) {
  const shiftToMainQueueElements = document.getElementById('shiftToMainQueueElements' + '-' + position);
  shiftToMainQueueElements.innerHTML = '';

  elements.forEach((element) => {
    const li = document.createElement('li');
    li.textContent = element;
    li.classList.add('shift-animation'); // Add 'shift-animation' class to the list item
    shiftToMainQueueElements.appendChild(li);
  });

  // Trigger CSS animation for shift elements
  // shiftToMainQueueElements.classList.add('shift-animation');
}

// Function to display elements shifting from main queue to sub queue
function displayShiftToSubQueueElements(elements, position) {
  const shiftToSubQueueElements = document.getElementById('shiftToSubQueueElements' + '-' + position);
  shiftToSubQueueElements.innerHTML = '';

  elements.forEach((element) => {
    const li = document.createElement('li');
    li.textContent = element;
    li.classList.add('shift-animation'); // Add 'shift-animation' class to the list item
    shiftToSubQueueElements.appendChild(li);
  });

  // Trigger CSS animation for shift elements
  // shiftToSubQueueElements.classList.add('shift-animation');
}

socket.on('queueData', (queueData) => {
  displayQueues(queueData);
});

/// Listen for countdown event from the server
socket.on('def-countdown', (countdown) => {
  displayCountdown(countdown, 'def');
});

// Handle reset timer button click event
const def_resetTimerButton = document.getElementById('def-resetTimerButton');
def_resetTimerButton.addEventListener('click', () => {
  socket.emit('resetTimer', 'def');
});

// Handle start timer button click event
const def_startTimerButton = document.getElementById('def-startTimerButton');
def_startTimerButton.addEventListener('click', () => {
  socket.emit('startTimer', 'def');
});

/// Listen for countdown event from the server
socket.on('mid-countdown', (countdown) => {
  displayCountdown(countdown, 'mid');
});

// Handle reset timer button click event
const mid_resetTimerButton = document.getElementById('mid-resetTimerButton');
mid_resetTimerButton.addEventListener('click', () => {
  socket.emit('resetTimer', 'mid');
});

// Handle start timer button click event
const mid_startTimerButton = document.getElementById('mid-startTimerButton');
mid_startTimerButton.addEventListener('click', () => {
  socket.emit('startTimer', 'mid');
});

/// Listen for countdown event from the server
socket.on('for-countdown', (countdown) => {
  displayCountdown(countdown, 'for');
});

// Handle reset timer button click event
const for_resetTimerButton = document.getElementById('for-resetTimerButton');
for_resetTimerButton.addEventListener('click', () => {
  socket.emit('resetTimer', 'for');
});

// Handle start timer button click event
const for_startTimerButton = document.getElementById('for-startTimerButton');
for_startTimerButton.addEventListener('click', () => {
  socket.emit('startTimer', 'for');
});

// Trigger the initial rendering of queues when the page is loaded
socket.emit('queueDataRequest');
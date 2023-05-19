const socket = io();

function displayQueues(queueData) {
  document.getElementById('mainQueueElements-D').innerHTML = queueData.mainQueue.map(createQueueElement).join('');
  document.getElementById('subQueueElements-D').innerHTML = queueData.subQueue.map(createQueueElement).join('');
  // Display elements shifting from sub queue to main queue
  displayShiftToMainQueueElements(queueData.shiftToMainQueue);

  // Display elements shifting from main queue to sub queue
  displayShiftToSubQueueElements(queueData.shiftToSubQueue);
}

function createQueueElement(element) {
  return '<div class="queue-element">' + element + '</div>';
} 

function displayCountdown(seconds) {
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;

  var countdown = document.getElementById('countdown');
  countdown.innerText = minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
}

// Function to display elements shifting from sub queue to main queue
function displayShiftToMainQueueElements(elements) {
  const shiftToMainQueueElements = document.getElementById('shiftToMainQueueElements');
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
function displayShiftToSubQueueElements(elements) {
  const shiftToSubQueueElements = document.getElementById('shiftToSubQueueElements');
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

// Listen for countdown event from the server
socket.on('countdown', (countdown) => {
  displayCountdown(countdown);
});

// Handle reset timer button click event
const resetTimerButton = document.getElementById('resetTimerButton');
resetTimerButton.addEventListener('click', () => {
  socket.emit('resetTimer');
});

// Handle start timer button click event
const startTimerButton = document.getElementById('startTimerButton');
startTimerButton.addEventListener('click', () => {
  socket.emit('startTimer');
});

// Trigger the initial rendering of queues when the page is loaded
socket.emit('queueDataRequest');
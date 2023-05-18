const socket = io();

function displayQueues(queueData) {
  document.getElementById('mainQueueElements').innerHTML = queueData.mainQueue.map(createQueueElement).join('');
  document.getElementById('subQueueElements').innerHTML = queueData.subQueue.map(createQueueElement).join('');
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
const socket = io();

// Handle update def sub queue size button click event
const updateDefSubQueueSizeButton = document.getElementById('updateDefSubQueueSizeButton');
updateDefSubQueueSizeButton.addEventListener('click', () => {
  const defSubQueueSizeInput = document.getElementById('defSubQueueSize');
  const defSubQueueSize = parseInt(defSubQueueSizeInput.value, 10);
  console.log(defSubQueueSizeInput)
  console.log(defSubQueueSize)
  updateSubQueueSize(defSubQueueSize, 'Def');
});

// Handle update def sub queue size button click event
const updateMidSubQueueSizeButton = document.getElementById('updateMidSubQueueSizeButton');
updateMidSubQueueSizeButton.addEventListener('click', () => {
  const midSubQueueSizeInput = document.getElementById('midSubQueueSize');
  const midSubQueueSize = parseInt(midSubQueueSizeInput.value, 10);
  console.log(midSubQueueSizeInput)
  console.log(midSubQueueSize)
  updateSubQueueSize(midSubQueueSize, 'Mid');
});

// Handle update def sub queue size button click event
const updateForSubQueueSizeButton = document.getElementById('updateForSubQueueSizeButton');
updateForSubQueueSizeButton.addEventListener('click', () => {
  const forSubQueueSizeInput = document.getElementById('forSubQueueSize');
  const forSubQueueSize = parseInt(forSubQueueSizeInput.value, 10);
  console.log(forSubQueueSizeInput)
  console.log(forSubQueueSize)
  updateSubQueueSize(forSubQueueSize, 'For');
});

// Handle update default timeout seconds button click event
const updateDefaultTimeoutSecondsButton = document.getElementById('updateDefaultTimeoutSecondsButton');
updateDefaultTimeoutSecondsButton.addEventListener('click', () => {
  const defaultTimeoutSecondsInput = document.getElementById('defaultTimeoutSeconds');
  const defaultTimeoutSeconds = parseInt(defaultTimeoutSecondsInput.value, 10);
  updateDefaultTimeoutSeconds(defaultTimeoutSeconds);
});

// Function to update the sub queue size
function updateSubQueueSize(size, type) {
  socket.emit('updateSubQueueSize', size, type);
}

// Function to update default timeout seconds
function updateDefaultTimeoutSeconds(defaultTimeoutSeconds) {
  socket.emit('updateDefaultTimeoutSeconds', defaultTimeoutSeconds);
}
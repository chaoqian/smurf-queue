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

// Handle def update default timeout seconds button click event
const def_updateDefaultTimeoutSecondsButton = document.getElementById('def-updateDefaultTimeoutSecondsButton');
def_updateDefaultTimeoutSecondsButton.addEventListener('click', () => {
  const def_defaultTimeoutSecondsInput = document.getElementById('def-defaultTimeoutSeconds');
  const def_defaultTimeoutSeconds = parseInt(def_defaultTimeoutSecondsInput.value, 10);
  updateDefaultTimeoutSeconds(def_defaultTimeoutSeconds, 'def');
});

// Handle def update default timeout seconds button click event
const mid_updateDefaultTimeoutSecondsButton = document.getElementById('mid-updateDefaultTimeoutSecondsButton');
mid_updateDefaultTimeoutSecondsButton.addEventListener('click', () => {
  const mid_defaultTimeoutSecondsInput = document.getElementById('mid-defaultTimeoutSeconds');
  const mid_defaultTimeoutSeconds = parseInt(mid_defaultTimeoutSecondsInput.value, 10);
  updateDefaultTimeoutSeconds(mid_defaultTimeoutSeconds, 'mid');
});

// Handle def update default timeout seconds button click event
const for_updateDefaultTimeoutSecondsButton = document.getElementById('for-updateDefaultTimeoutSecondsButton');
for_updateDefaultTimeoutSecondsButton.addEventListener('click', () => {
  const for_defaultTimeoutSecondsInput = document.getElementById('for-defaultTimeoutSeconds');
  const for_defaultTimeoutSeconds = parseInt(for_defaultTimeoutSecondsInput.value, 10);
  updateDefaultTimeoutSeconds(for_defaultTimeoutSeconds, 'for');
});


// Function to update the sub queue size
function updateSubQueueSize(size, type) {
  socket.emit('updateSubQueueSize', size, type);
}

// Function to update default timeout seconds
function updateDefaultTimeoutSeconds(defaultTimeoutSeconds, prefix) {
  socket.emit('updateDefaultTimeoutSeconds', defaultTimeoutSeconds, prefix);
}
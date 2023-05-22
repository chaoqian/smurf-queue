// Attach event listener to a parent element that remains in the DOM
document.addEventListener('dragstart', function (event) {
  if (event.target.classList.contains('draggable')) {
    // Handle the dragStart event on draggable elements
    event.dataTransfer.setData('text/plain', event.target.id);
  }
});

document.addEventListener('dragend', function (event) {
  if (event.target.classList.contains('draggable')) {
    // Handle the dragStart event on draggable elements
    event.preventDefault();
  }
});

// Drag over event handler
function dragOver(event) {
  event.preventDefault();
}

function addElementsAtBeginning(parentElement, element) {
  if (parentElement.children.length == 0) {
    parentElement.appendChild(element);
  }
  else {
    parentElement.insertBefore(element, parentElement.children[0]);
  }
}

// Drop event handler
function drop(event) {
  event.preventDefault();
  const elementId = event.dataTransfer.getData('text/plain');
  const element = document.getElementById(elementId);
  const dropzone = event.target;

  if (dropzone.classList.contains('elements-wrapper')) {
    // empty
    addElementsAtBeginning(dropzone, element);
  } else if (dropzone.classList.contains('queue')) {
    const allChildren = dropzone.children;
    for (var index = 0; index < allChildren.length; index++) {
      if (allChildren[index].classList.contains('elements-wrapper')) {
        addElementsAtBeginning(allChildren[index], element);
        break;
      }
    }
  } else if (dropzone.parentNode.classList.contains('elements-wrapper')) {
    const siblings = dropzone.parentNode.children;
    const dropIndex = Array.from(siblings).indexOf(dropzone);
    dropzone.parentNode.insertBefore(element, siblings[dropIndex + 1]);
  }
}

// get current queue elelemnts
function getQueueElements(prefix) {
  var subQueueWrapperId = 'subQueueElements-' + prefix[0].toUpperCase();
  var mainQueueWrapperId = 'mainQueueElements-' + prefix[0].toUpperCase();
  const sub_wrapper = document.getElementById(subQueueWrapperId);
  const main_wrapper = document.getElementById(mainQueueWrapperId);
  const all_subs = sub_wrapper.children;
  const all_main = main_wrapper.children;
  var subQueue = [];
  var mainQueue = [];
  for (var index = 0; index < all_subs.length; index++) {
    if (all_subs[index].classList.contains('queue-element')) {
      subQueue.push(all_subs[index].textContent);
    }
  }
  for (var index = 0; index < all_main.length; index++) {
    if (all_main[index].classList.contains('queue-element')) {
      mainQueue.push(all_main[index].textContent);
    }
  }
  return { subQueue, mainQueue };
}

// Get the all queue element
const all_elements_wrapper = document.querySelectorAll('.elements-wrapper');
all_elements_wrapper.forEach((element) => {
  element.addEventListener('dragover', dragOver);
  element.addEventListener('drop', drop);
});

const all_queues = document.querySelectorAll('.queue');
all_queues.forEach((element) => {
  element.addEventListener('dragover', dragOver);
  element.addEventListener('drop', drop);
});


// Handle force update button click event
const def_forceUpdateButton = document.getElementById('def-forceUpdate');
def_forceUpdateButton.addEventListener('click', () => {
  // get current queue data
  socket.emit('forceUpdate', getQueueElements('def'), 'def');
});

const mid_forceUpdateButton = document.getElementById('mid-forceUpdate');
mid_forceUpdateButton.addEventListener('click', () => {
  // get current queue data
  socket.emit('forceUpdate', getQueueElements('mid'), 'mid');
});

const for_forceUpdateButton = document.getElementById('for-forceUpdate');
for_forceUpdateButton.addEventListener('click', () => {
  // get current queue data
  socket.emit('forceUpdate', getQueueElements('for'), 'for');
});
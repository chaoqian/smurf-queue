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

// Drop event handler
function drop(event) {
  event.preventDefault();
  const elementId = event.dataTransfer.getData('text/plain');
  const element = document.getElementById(elementId);
  const dropzone = event.target;

  if (dropzone.classList.contains('elements-wrapper')) {
    // empty
    dropzone.appendChild(element);
  } else if (dropzone.classList.contains('queue')) {
    const allChildren = dropzone.children;
    for (var index = 0; index < allChildren.length; index ++) {
      if (allChildren[index].classList.contains('elements-wrapper')) {
        allChildren[index].appendChild(element);
        break;
      }
    }
  } else if (dropzone.parentNode.classList.contains('elements-wrapper')) {
    const siblings = dropzone.parentNode.children;
    const dropIndex = Array.from(siblings).indexOf(dropzone);
    dropzone.parentNode.insertBefore(element, siblings[dropIndex + 1]);
  }

  // TODO: send latest to server and update memory
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

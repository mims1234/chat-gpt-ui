document.getElementById('chat-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting immediately

  const askButton = document.getElementById('ask-button');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // Disable the ask button and show the loading indicator
  askButton.disabled = true;
  loadingIndicator.style.display = 'block';

  // Submit the form after a brief delay to ensure the loading state is visible
  setTimeout(() => {
    event.target.submit();
  }, 100);
  
  // Scroll to bottom after form submission
  setTimeout(scrollToBottom, 100);
});

document.getElementById('prompt').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    document.getElementById('ask-button').click();
  }
});

function clearConversation() {
  // Clear the conversation in the UI
  document.getElementById('chat-history-list').innerHTML = '';
  document.getElementById('prompt').value = '';
  document.getElementById('model').disabled = false;

  // Send a request to the server to clear the session messages
  fetch('/clear', {
    method: 'POST',
  }).then(response => {
    if (response.ok) {
      window.location.href = '/';
    } else {
      console.error('Failed to clear conversation on the server.');
    }
  }).catch(error => {
    console.error('Error:', error);
  });
}

function copyCode(button) {
  const codeBlock = button.parentElement.nextElementSibling;
  navigator.clipboard.writeText(codeBlock.innerText).then(() => {
    alert('Code copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy code: ', err);
  });
}

function scrollToBottom() {
  const mainSection = document.querySelector('main');
  mainSection.scrollTop = mainSection.scrollHeight;
}

document.addEventListener('DOMContentLoaded', (event) => {
  scrollToBottom();
});

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('prompt');
    const chatContainer = document.getElementById('chat-container');
    const toggleChatButton = document.getElementById('toggle-chat');
  
    const adjustTextareaHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
  
    textarea.addEventListener('input', adjustTextareaHeight);
  
    // Initial adjustment to fit the default value if any
    adjustTextareaHeight();
  
    // Toggle minimize/maximize chat container
    toggleChatButton.addEventListener('click', () => {
      chatContainer.classList.toggle('minimized');
      toggleChatButton.textContent = chatContainer.classList.contains('minimized') ? 'Maximize' : 'Minimize';
    });
  });
  
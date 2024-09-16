document.addEventListener("DOMContentLoaded", () => {
  const chatPopup = document.getElementById('chatPopup');
  const chatIcon = document.getElementById('chat-icon');
  const closeIcon = document.getElementById('close-icon'); 

    let chatInitialized = false; // Flag to check if the chat has been initialized
  
    function initializeChat() {
      displayInputMessage("Hi, I'm Fleet Enable's Support AI. Ask me anything for example:", "bot");
      displaySuggestions();
  
      document.getElementById("send-btn").addEventListener("click", () => {
        sendMessage();
        hideGreetingAndSuggestions(); // Hide greeting and suggestions after user clicks send
      });
  
      document.getElementById("user-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          sendMessage();
          hideGreetingAndSuggestions(); // Hide greeting and suggestions after user presses Enter
        }
      });
    }
  
    function displayInputMessage(data, sender) {
      const chatbox = document.getElementById("chatbox");
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", sender);
      messageElem.innerHTML = data;
      chatbox.appendChild(messageElem);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    function displaySuggestions() {
      const chatbox = document.getElementById("chatbox");
      const suggestions = [
        "I need help with pending orders!",
        "Can you assist me in creating preplan?",
        "How to find credit limit of an account?",
        "How to fetch billing reports of an account?"
      ];
  
      const suggestionContainer = document.createElement("div");
      suggestionContainer.classList.add("suggestions");
  
      suggestions.forEach(suggestion => {
        const suggestionElem = document.createElement("button");
        suggestionElem.classList.add("suggestion");
        suggestionElem.textContent = suggestion;
        suggestionElem.addEventListener("click", () => {
          document.getElementById("user-input").value = suggestion;
          sendMessage();
          hideGreetingAndSuggestions(); // Hide greeting and suggestions after user clicks on a suggestion
        });
        suggestionContainer.appendChild(suggestionElem);
      });
  
      chatbox.appendChild(suggestionContainer);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    function sendMessage() {
      const userInput = document.getElementById("user-input").value;
      if (userInput.trim() === "") return;
    
      displayInputMessage(userInput, "user");
      document.getElementById("user-input").value = "";
      showLoadingDots();
    
      // Remove the suggestion container if it exists
      const suggestionContainer = document.querySelector(".suggestions");
      if (suggestionContainer) {
        suggestionContainer.remove();
      }
    
      fetch("http://127.0.0.1:8000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_query: userInput
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          hideLoadingDots();
          console.log(data, "data");
          displayMessage(data, "bot");
        })
        .catch((error) => {
          hideLoadingDots();
          console.error("Error:", error);
        });
    }       
  
    function displayMessage(data, sender) {
      const chatbox = document.getElementById("chatbox");
  
      // Create a message container element
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", sender);
  
      // Create a span element for displaying the message text
      const messageSpan = document.createElement("span");
  
      // Helper function to format the message with bold and links
      const formatMessage = (messageText) => {
          // Convert **bold text** to <strong> tags
          let formattedText = messageText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          // Convert [text](URL) to <a href="URL">text</a>
          formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
          return formattedText.replace(/\n/g, "<br>"); // Convert line breaks to <br> tags
      };
  
      // Format the message
      let formattedMessage = formatMessage(data.message);
  
      // Set the inner HTML of the span element with the formatted message
      messageSpan.innerHTML = formattedMessage;
  
      // Append the span element to the message container
      messageElem.appendChild(messageSpan);
  
      // Check if images exist and create image elements for each
      if (Array.isArray(data.images)) {
          data.images.forEach((imageBase64) => {
              const imageElem = document.createElement("img");
              imageElem.src = `data:image/jpeg;base64,${imageBase64}`;
              imageElem.alt = "Image";
              imageElem.style.maxWidth = "100%"; // Set a maximum width to ensure it fits within the chatbox
              imageElem.style.marginTop = "10px"; // Add some spacing between the text and image
  
              // Add click event to maximize the image
              imageElem.addEventListener('click', () => {
                  showImageModal(imageElem.src);
              });
  
              // Append the image element to the message container
              messageElem.appendChild(imageElem);
          });
      }
  
      // Append the message element to the chatbox
      chatbox.appendChild(messageElem);
  
      // Scroll to the bottom of the chatbox
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    // Function to create and display the image modal
    function showImageModal(imageSrc) {
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('image-modal');
    
        // Create the image element for the modal
        const modalImage = document.createElement('img');
        modalImage.src = imageSrc;
        modalImage.classList.add('modal-image');
    
        // Append the image to the modal container
        modalContainer.appendChild(modalImage);
    
        // Add click event to close the modal
        modalContainer.addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
    
        // Append the modal container to the body
        document.body.appendChild(modalContainer);
    }
  
    // Add styles for the image modal (using JavaScript)
    const style = document.createElement('style');
    style.innerHTML = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
    
        .modal-image {
            max-width: 90%;
            max-height: 90%;
            border-radius: 5px;
        }
    `;
    document.head.appendChild(style);  
       
    function showLoadingDots() {
      const chatbox = document.getElementById("chatbox");
      const loadingDots = document.createElement("div");
      loadingDots.id = "loading-dots";
      loadingDots.classList.add("loading");
      loadingDots.innerHTML = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      `;
      chatbox.appendChild(loadingDots);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    function hideLoadingDots() {
      const loadingDots = document.getElementById("loading-dots");
      if (loadingDots) {
        loadingDots.remove();
      }
    }
  
    function hideGreetingAndSuggestions() {
      const suggestionsContainer = document.querySelector('.suggestions');
      if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none'; // Hide the suggestions container
      }
  
      const greetingMessage = document.querySelector('.message.bot');
      if (greetingMessage) {
        greetingMessage.style.display = 'none'; // Hide the greeting message
      }
    }
  
    window.toggleChatBot = function () {
  
      if (chatPopup.style.display === 'none' || chatPopup.style.display === '') {
          chatPopup.style.display = 'flex';
          chatIcon.style.display = 'none';
          closeIcon.style.display = 'block';
  
          if (!chatInitialized) {
              initializeChat(); // Initialize the chat only if it hasn't been initialized
              chatInitialized = true; // Set the flag to true after initialization
          }
      } else {
          chatPopup.style.display = 'none';
          chatIcon.style.display = 'block';
          closeIcon.style.display = 'none';
      }
    };
  
  });  
  
document.addEventListener("DOMContentLoaded", () => {
  const chatPopup = document.getElementById('chatPopup');
  const chatIcon = document.getElementById('chat-icon');
  const closeIcon = document.getElementById('close-icon'); 
  const userInputContainer = document.getElementById('user-input-container');

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
        "How to start billing for an order manually?",
        "How to search for zero billing data?",
        "How to configure LOS?",
        "How to get the billing information for an order?"
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

    let lastUserInput = "";
  
    function sendMessage() {
      const userInput = document.getElementById("user-input").value;
      if (userInput.trim() === "") return;

      lastUserInput = userInput;
    
      displayInputMessage(userInput, "user");
      document.getElementById("user-input").value = "";
    
      // Show the bot typing indicator
      addBotTypingIndicator();
    
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
          user_query: userInput,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          removeTypingIndicator(); // Remove the typing indicator
          displayMessage(data, "bot");
          console.log(data);
        })
        .catch((error) => {
          removeTypingIndicator(); // Remove the typing indicator in case of an error
          console.error("Error:", error);
        });
    }
    
    function addBotTypingIndicator() {
      const chatbox = document.getElementById("chatbox");
    
      // Create a container for the bot's typing indicator
      const botContainer = document.createElement("div");
      botContainer.classList.add("bot-container");
      botContainer.id = "bot-typing-indicator"; // ID to reference it later
    
      // Create the bot icon element
      const botIcon = document.createElement("div");
      botIcon.classList.add("bot-icon");
    
      // Create the message container to hold the typing dots
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", "bot");
    
      // Create the typing dots
      const dotsContainer = document.createElement("div");
      dotsContainer.classList.add("typing-dots");
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dotsContainer.appendChild(dot);
      }
    
      // Append typing dots to the message container
      messageElem.appendChild(dotsContainer);
    
      // Append the bot icon and message container to the botContainer
      botContainer.appendChild(botIcon);
      botContainer.appendChild(messageElem);
    
      // Append the botContainer to the chatbox
      chatbox.appendChild(botContainer);
    
      // Scroll to the bottom of the chatbox
      chatbox.scrollTop = chatbox.scrollHeight;
    }
    
    function removeTypingIndicator() {
      // Find and remove the typing indicator container
      const typingIndicator = document.getElementById("bot-typing-indicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
    
    function displayMessage(data, sender) {
      const chatbox = document.getElementById("chatbox");
  
      // Create a container for the bot's message and icon
      const botContainer = document.createElement("div");
      botContainer.classList.add("bot-container");
  
      // Create the bot icon element for bot messages
      if (sender === "bot") {
          const botIcon = document.createElement("div");
          botIcon.classList.add("bot-icon");
          botContainer.appendChild(botIcon);
      }
  
      // Create a message container element
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", sender);
  
      // Create a span element for displaying the message text
      const messageSpan = document.createElement("span");
  
      // Helper function to format the message with bold and links
      const formatMessage = (messageText) => {
          let formattedText = messageText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
          return formattedText.replace(/\n/g, "<br>");
      };
  
      // Format the message
      let formattedMessage = formatMessage(data.message);
  
      // Set the inner HTML of the span element with the formatted message
      messageSpan.innerHTML = formattedMessage;
  
      // Append the span element to the message container
      messageElem.appendChild(messageSpan);
  
      // Append the message container to the botContainer
      botContainer.appendChild(messageElem);
  
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
  
      // Create the emoji reaction bar
      const emojiReactionBar = document.createElement("div");
      emojiReactionBar.classList.add("emoji-reaction-bar");
  
      // Define emojis without initial counts
      const emojis = [
          { emoji: "👍", feedback: "Positive", count: 0 },
          { emoji: "👎", feedback: "Negative", count: 0 }
      ];
  
      let hasSelectedEmoji = false; // Flag to track if an emoji has been selected
      let selectedFeedback = null; // To store the selected feedback
  
      // Create an emoji button for each emoji
      emojis.forEach((emojiObj) => {
          const emojiButton = document.createElement("button");
          emojiButton.classList.add("emoji-button");
          emojiButton.innerHTML =`${emojiObj.emoji} <span class="emoji-count">${emojiObj.count}</span>`;
          // Event listener to allow only one emoji selection
          emojiButton.addEventListener("click", function () {
              if (!hasSelectedEmoji) {
                  const countSpan = this.querySelector(".emoji-count");
                  countSpan.textContent = 1; // Set the selected emoji count to 1
                  hasSelectedEmoji = true; // Mark as selected
                  selectedFeedback = emojiObj.feedback; // Store the selected feedback
  
                  // If thumbs down is clicked, show feedback form
                  if (emojiObj.emoji === "👎") {
                      userInputContainer.style.display = "none";
                      showFeedbackForm(botContainer); // Show feedback form
                  }
  
                  // Send data to the API after the feedback is clicked
                  sendFeedback(lastUserInput, data.message, selectedFeedback);
              }
          });
  
          // Append each emoji button to the emoji reaction bar
          emojiReactionBar.appendChild(emojiButton);
      });
  
      // Append the emoji reaction bar BELOW the message container
      botContainer.appendChild(emojiReactionBar);
  
      // Append the botContainer to the chatbox
      chatbox.appendChild(botContainer);
  
      // Scroll to the bottom of the chatbox
      chatbox.scrollTop = chatbox.scrollHeight;
  }
  
  // Function to send feedback to the API
  function sendFeedback(userInput, message, feedback) {
      
      // Create the body for the POST request
      const requestBody = {
          user_question: userInput,
          ai_response: message,
          feedback: feedback
      };
  
      // Send the POST request using Fetch API
      fetch("http://127.0.0.1:8000/dbupdate", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
      })
      .then(response => {
          if (response.ok) {
              return response.json();
          } else {
              throw new Error('Error sending feedback.');
          }
      })
      .then(data => {
          console.log("Feedback successfully sent:", data);
      })
      .catch(error => {
          console.error("Error:", error);
      });
  }
  
  
  // Function to show feedback form if thumbs down is clicked
  function showFeedbackForm(botContainer) {
    // Create a form element
    const feedbackForm = document.createElement("form");
    feedbackForm.classList.add("feedback-form");

    // Define form fields
    const fields = [
        { label: "Name", type: "text", id: "userName", required: true },
        { label: "Email", type: "email", id: "userEmail", required: true },
        { label: "Phone Number", type: "tel", id: "userPhone", required: true },
        { label: "Issue", type: "textarea", id: "userIssue", required: true }
    ];

    // Loop through fields and create input elements
    fields.forEach(field => {
        const fieldLabel = document.createElement("label");
        fieldLabel.textContent = field.label;

        const fieldInput = field.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
        fieldInput.type = field.type;
        fieldInput.id = field.id;
        fieldInput.name = field.id;
        fieldInput.required = field.required;  // Set the field as required

        // Append label and input to the form
        feedbackForm.appendChild(fieldLabel);
        feedbackForm.appendChild(fieldInput);
    });

    // Add submit button to form
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Submit Feedback";

    // Event listener for form submission
    feedbackForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Gather form data
        const formData = {
            user_name: document.getElementById("userName").value,
            user_mail: document.getElementById("userEmail").value,
            user_number: document.getElementById("userPhone").value,
            user_feedback: document.getElementById("userIssue").value
        };

        // Validate all fields are filled in
        if (!formData.user_name || !formData.user_mail || !formData.user_number || !formData.user_feedback) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            // Send the form data to the API via POST request
            const response = await fetch("http://127.0.0.1:8000/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Thank you for your feedback!");
                feedbackForm.reset();  // Optionally, clear the form after submission
            } else {
                alert("There was an error submitting your feedback. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("There was an issue connecting to the server.");
        }
    });

    feedbackForm.appendChild(submitButton);

    // Append the form to the botContainer (below the thumbs down message)
    botContainer.appendChild(feedbackForm);
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
  

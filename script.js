const typingForm= document.querySelector('.typing-form');
const chatList= document.querySelector('.chat-list');
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton=document.querySelector("#toggle-theme-button")
const deleteChatButton=document.querySelector("#delete-chat-button");
let isGeneratingResponse= false;

// the api configuration
const API_KEY="AIzaSyCGT6A5j4WYk6wsnXn5_hliGUJmnmpcbC4";
const API_URL=`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;


// this function helps us to relod the choosen theme on relod
const loadLocalStorage=()=>{
    const savedChats= localStorage.getItem("savedChats");
    const islight_mode=(localStorage.getItem("themeColor")==="light_mode");
    document.body.classList.toggle("light_mode",islight_mode);
    toggleThemeButton.innerText=islight_mode? "dark_mode" : "light_mode";
    // adding auto scroll to bottom
    chatList.scrollTo(0,chatList.scrollHeight);
    // document.body.classList.toggle("hide-header",savedChats);
    // restoring the saved chats
    chatList.innerHTML=savedChats|| "";
    document.body.classList.toggle("hide-header",savedChats);
}
// calling the function
loadLocalStorage();
// function in order to show the message of the user on the screen.
// create  a new message element oand return it
const createMessageElement=(content, ...classes)=>{
     const div = document.createElement("div");
     div.classList.add("message", ...classes);
     div.innerHTML=content;
     return div;

}

// creating the typing effect function- words one by one
// const showTypingEffect= (text, textElement)=>{
//     const words= text.split(' ');
//     let currentWordIndex=0;
//     const typinginterval= setInterval(()=>{
//         // append each word to text element with space
//         textElement.innerText+=(currentWordIndex===0 ? '':' ')+words[currentWordIndex];
//         // if all worda re displayed
//         if(currentWordIndex===words.length){
//             clearInterval(typinginterval);

//         }
//     },75)
// }

const showTypingEffect = (text, textElement,incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        // Append each word to text element with space
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
            incomingMessageDiv.querySelector(".icon").classList.add("hide")
        // Move to the next word
        currentWordIndex++;

        // If all words are displayed, clear the interval
        if (currentWordIndex >= words.length) {
            isGeneratingResponse = false;
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").classList.remove("hide")
            // saving the chat
            localStorage.setItem("savedChats", chatList.innerHTML);
            
            
        }
        // adding auto scroll to bottom
        chatList.scrollTo(0,chatList.scrollHeight);
    }, 75);
};

// function for the API response fetch response from the api based on user message
const generateAPIResponse= async(incomingMessageDiv)=>{
    // getting the text element
    const textElement= incomingMessageDiv.querySelector('.text');
    // send a POST request to the API with the user's message

    try{
        const response = await fetch(API_URL,{
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body:JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{text: userMessage}]

                }]
            })
        });

        const data= await response.json();
        // now targeting the data as its in inside the array we need the index to access them
        const apiResponse= data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '&1');
        // textElement.innerText=apiResponse;
        // showing the typing effect
        showTypingEffect(apiResponse, textElement,incomingMessageDiv);

        // displaying the data in the console
        // console.log(data);

    }
    catch(error){
        isGeneratingResponse= false;
        console.log(error)
    }
    finally{

        // removing the loading bar
        incomingMessageDiv.classList.remove("loading");
    }

}
// creating a function to copy the text answers
const copyMessage=(copyIcon)=>{
    const messageText=copyIcon.parentElement.querySelector(".text").innerText;
    // this is used to copy the text
    navigator.clipboard.writeText(messageText);
    // show tick icon
    copyIcon.innerText="done"
    setTimeout(()=>copyIcon.innerText="content_copy",1000);
}

// function to show the loading animation while waiting for the API
const showLoadingAnimation=()=>{
    const html =`<div class="message-content">
        <img src="ailogo.svg" alt="AI Image" class="avatar">
        <p class="text"> </p>
      <div class="loading-indicator">
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
      </div>
      </div>
      <span onclick="copyMessage(this)" class="icon material-symbols-outlined">content_copy</span>`

  // a different function
const incomingMessageDiv= createMessageElement(html,"incoming", "loading");
chatList.appendChild(incomingMessageDiv);
// adding auto scroll to bottom
chatList.scrollTo(0,chatList.scrollHeight);

// generating the api response
generateAPIResponse(incomingMessageDiv);

}

let userMessage=null;
// creating the handleOutgoingChat Function
const handleOutgoingChat = ()=>{
    userMessage= typingForm.querySelector('.typing-input').value.trim() || userMessage;
    // exist if there is no message
    if(!userMessage || isGeneratingResponse ) return;
    isGeneratingResponse=true;
    
    // creating the html thing
    const html =` <div class="message-content">
          <img src="user.jpg" alt="User Image" class="avatar">
          <p class="text"></p>
        </div>`

        // a different function
    const outgoingMessageDiv= createMessageElement(html,"outgoing");
    outgoingMessageDiv.querySelector(".text").innerText=userMessage;
    // creating an element of outgoing message and adding it to the chat list
    chatList.appendChild(outgoingMessageDiv);
    // clearing the input field
    typingForm.reset(); 
    // using the hide header
    document.body.classList.add("hide-header");
    // adding auto scroll to bottom
    chatList.scrollTo(0,chatList.scrollHeight);
    // showing the animation
    setTimeout(showLoadingAnimation, 500);

}
// preventing the default submission and the outgoing message
typingForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    // calling a new function
    handleOutgoingChat()

})
// adding the changing theme button, now we can create the light mode and implement the changes
// and finnaly when the function got triggered a new class is applied
toggleThemeButton.addEventListener("click",()=>{
    const isLightMode= document.body.classList.toggle("light_mode")
    // saving the choosen color by default in the system browser
    localStorage.setItem("themeColor", isLightMode? "light_mode" : "dark_mode" )
    // console.log('changed')
    toggleThemeButton.innerText=isLightMode? "dark_mode" : "light_mode";
})

// handling the delete button
deleteChatButton.addEventListener("click",(e)=>{
    if(confirm("Are you sure to delete all the messeges")){
        // then delete
        localStorage.removeItem("savedChats");
        loadLocalStorage()
    }
})

// clicking on the suggestion bars
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});
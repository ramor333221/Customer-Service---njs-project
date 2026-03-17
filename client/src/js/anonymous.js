import axios from 'axios';
import { baseUrl } from './config';
import { ws } from './config';

window.onload = async () => {
    const imageUrl = localStorage.getItem('myPicture');
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Uploaded Image';
        img.style.width = '100px';
        img.style.height = '100px';
        img.id = 'myUploadedImage';
        document.body.appendChild(img);
    }
};


function closeModal(backdrop, modal) {
    document.body.removeChild(backdrop);
    document.body.removeChild(modal);
    document.body.style.overflow = 'auto';
}

document.querySelector('#logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '.../index.html';
});

document.querySelector('#newConversation').addEventListener('click', () => {
    document.getElementById('topicInputDiv').style.display = 'block';
    document.getElementById('newConversation').style.display = 'none';
    document.getElementById('gifContainer').style.display = 'none';
});

let currentSocket = null;
let isChatOpen = false;
let inactivityTimer;
let topic;

document.getElementById('submitTopic').addEventListener('click', async () => {
    topic = document.getElementById('topicSelect').value;
    const token = localStorage.getItem('token');

    if (topic && token) {
        try {
            const response = await axios.post(`${baseUrl}/queue`, {topic: topic}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const conversationId = response.data.itemId; 
            document.getElementById('topicInputDiv').style.display = 'none';
            document.getElementById('newConversation').style.display = 'none';

            showWaitingMessage(conversationId);

            currentSocket = new WebSocket(`${ws}`);
            const username = localStorage.getItem('name') || 'User1';

            currentSocket.addEventListener('open', () => {
                const connectMessage = {
                    type: 'join_conversation',
                    conversationId: conversationId,
                    username: username,
                    role: 'customer',
                    timestamp: new Date().toISOString(),
                    customerPictureUrl: localStorage.getItem('myPicture'),
                };
                currentSocket.send(JSON.stringify(connectMessage));
            });


            currentSocket.addEventListener('message', (event) => {
                const message = JSON.parse(event.data);
                console.log('Received:', message);

                if (message.type === 'worker_joined' && message.message !== `${username} has joined the conversation.`) {
                    waitSound.pause();
                    openChatWindow(conversationId);
                } else if (message.type === 'message' && message.conversationId === conversationId && message.username!=localStorage.getItem('name')) {
                    pingSound.play();
                    const chatMessages = document.querySelector(`#chatMessages_${conversationId}`);
                    const messageDiv = document.createElement('div');

                    const pictureUrl = message.pic;

                    if (message.username === username) {
                        messageDiv.innerHTML = `
                            <div class="chat-message user-message">
                                <img src="${pictureUrl}" alt="${message.username}" />
                                <div>
                                    <p>${message.content}</p>
                                    <span class="timestamp">Time: ${new Date(message.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        `;
                    } else {
                        messageDiv.innerHTML = `
                            <div class="chat-message">
                                <img src="${pictureUrl}" alt="${message.username}" />
                                <div>
                                    <p>${message.content}</p>
                                    <span class="timestamp">Time: ${new Date(message.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        `;
                    }
                    chatMessages.appendChild(messageDiv);
                } else if (message.type === 'chat_closed') {
                    closeChat(message.conversationId);
                }
            });


            currentSocket.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
            });

            currentSocket.addEventListener('close', () => {
                console.log('WebSocket connection closed');
            });

        } catch (error) {
            document.querySelector('#queueResponse').innerText = 'Error adding to queue: ' + (error.response?.data?.error?.message || error.message);
        }
    } else {
        alert("Topic cannot be empty.");
    }
});

const waitSound = new Audio("/public/BB001.WAV");
const pingSound = new Audio("/public/ping.mp3");
function showWaitingMessage(conversationId) {
    waitSound.loop = true;
    waitSound.play();
    const waitingMessageContainer = document.createElement('div');
    waitingMessageContainer.id = `waitingMessage_${conversationId}`;
    waitingMessageContainer.className = 'waiting-message';
    waitingMessageContainer.innerHTML = `
        <img src="/public/img/connect.gif" alt="Waiting..." />
        <h2>Please wait while we connect you to a worker...</h2>
    `;
    document.querySelector('#conversations').appendChild(waitingMessageContainer);
}

async function openChatWindow(conversationId) {
    if (isChatOpen) return; 

    const url = `${baseUrl}/conversation/${conversationId}`; 
    const token = localStorage.getItem('token');

    const response = await axios.post(url, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const date = new Date().toLocaleString();

    const chatWindow = document.createElement('div');
    chatWindow.classList.add('chat-window');

    chatWindow.innerHTML = `
                <div class="chat-header">
                    <h3>Topic: ${topic}</h3>
                    <p>Date Created: ${date}</p>
                    <button class="buttunC" id="closeChatButton_${conversationId}">Close Chat</button>
                </div>
                <div class="chat-messages" id="chatMessages_${conversationId}"></div>
                <div class="chat-input">
                    <input type="text" id="messageInput_${conversationId}" placeholder="Type your message..." />
                    <button id="sendMessageButton_${conversationId}">Send</button>
                </div>
            `;

    const conversationsContainer = document.querySelector('#conversations');
    conversationsContainer.appendChild(chatWindow);


    const waitingMessage = document.querySelector(`#waitingMessage_${conversationId}`);
    if (waitingMessage) {
        waitingMessage.remove();
    }

    const messageInput = document.querySelector(`#messageInput_${conversationId}`);
    const sendMessageButton = document.querySelector(`#sendMessageButton_${conversationId}`);
    const closeChatButton = document.querySelector(`#closeChatButton_${conversationId}`);

    isChatOpen = true; 


    sendMessageButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message && currentSocket && currentSocket.readyState === WebSocket.OPEN) {
            const messageToSend = {
                type: 'message',
                conversationId: conversationId,
                content: message,
                username: localStorage.getItem('name') || 'User1',
                timestamp: new Date().toISOString(),
                role: "customer",
            };
            currentSocket.send(JSON.stringify(messageToSend));
            messageInput.value = '';

            
            const converContent = [{
                description: message,
                writer: "customer",
            }];

            try {
                await axios.patch(`${baseUrl}/conversation`, {
                    _id: conversationId,
                    converContent: converContent
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } catch (error) {
                console.error('Error updating conversation content:', error.message);
            }

            messageInput.value = '';
            resetInactivityTimer(conversationId);
        }
    });


    closeChatButton.addEventListener('click', () => {
        closeChat(conversationId);
    })
}

function closeChat(conversationId) {
    if (!isChatOpen) return; 

    if (currentSocket) {
        const closeChatMessage = {
            type: 'close_chat',
            conversationId: conversationId,
        };
        currentSocket.send(JSON.stringify(closeChatMessage));
    }

    const chatWindow = document.querySelector(`#chatMessages_${conversationId}`).parentElement.parentElement;
    if (chatWindow) {
        chatWindow.remove(); 
    }

    isChatOpen = false; 
    document.getElementById('newConversation').style.display = 'block';
}

function startInactivityTimer(conversationId) {
    inactivityTimer = setTimeout(() => {
        closeChat(conversationId);
    }, 1 * 60 * 1000);
}

function resetInactivityTimer(conversationId) {
    clearTimeout(inactivityTimer); 
    startInactivityTimer(conversationId); 
}







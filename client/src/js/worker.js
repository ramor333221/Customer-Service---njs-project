import axios from 'axios';
import { baseUrl } from './config';
import { ws } from './config';

document.querySelector('#updateForm').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await axios.post(`${baseUrl}/user/token`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const worker = response.data;
            createUpdateForm(worker.email, worker.name, worker.phone, worker.pictureUrl);
        } catch (error) {
            console.log('Error fetching worker data: ' + (error.response?.data?.msg || error.message));
        }
    } else {
        console.log('Error fetching worker data: No token found');
    }
});

window.onload = () => {
    let permission=localStorage.permission;
        if(permission!=="worker"){
            window.location.href = '.../index.html';
        }
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

document.querySelector('#logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '.../index.html';
});

function createUpdateForm(email, name, phone, picture) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <h2>Update Worker</h2>
        <div style="text-align: center;">
            <img id="profilePicture" src="${baseUrl}${picture}" alt="${name}'s picture" style="width: 100px; height: 100px; border-radius: 50%; display: inline-block;" />
            <div>
                <input type="file" id="updateWorkerImage" accept="image/*" style="display: none;" />
                <button id="addPictureButton">Add Picture <span id="icon"></span></button>
            </div>
        </div>
        <input type="text" id="updateWorkerName" placeholder="Name" value="${name}" /> 
        <input type="text" id="updateWorkerPhone" placeholder="Phone" value="${phone}" />
        <div class="password-container">
            <input type="password" id="oldPassword" placeholder="Old Password" required />
            <span id="toggleOldPassword" class="toggle-password">👁️</span>
        </div>
        <div class="password-container">
            <input type="password" id="newPassword" placeholder="New Password" required />
            <span id="toggleNewPassword" class="toggle-password">👁️</span>
        </div>
        <div class="password-container">
            <input type="password" id="confirmNewPassword" placeholder="Confirm New Password" required />
            <span id="toggleConfirmNewPassword" class="toggle-password">👁️</span>
        </div>
        <button id="saveWorkerButton">Save</button>
        <button id="cancelUpdateButton">Cancel</button>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    document.getElementById('addPictureButton').onclick = () => {
        document.getElementById('updateWorkerImage').click();
    };


    document.getElementById('updateWorkerImage').addEventListener('change', function () {
        const icon = document.getElementById('icon');
        const imageFile = this.files[0];

        if (imageFile) {
            const newImageUrl = URL.createObjectURL(imageFile);
            document.getElementById('profilePicture').src = newImageUrl;
            icon.innerHTML = '✔'; 
        } else {
            icon.innerHTML = ''; 
        }
    });


    document.getElementById('toggleOldPassword').addEventListener('click', () => {
        const oldPasswordInput = document.getElementById('oldPassword');
        const type = oldPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        oldPasswordInput.setAttribute('type', type);
        document.getElementById('toggleOldPassword').textContent = type === 'password' ? '👁️' : '🔐'; 
    });

    document.getElementById('toggleNewPassword').addEventListener('click', () => {
        const newPasswordInput = document.getElementById('newPassword');
        const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        newPasswordInput.setAttribute('type', type);
        document.getElementById('toggleNewPassword').textContent = type === 'password' ? '👁️' : '🔐'; 
    });

    document.getElementById('toggleConfirmNewPassword').addEventListener('click', () => {
        const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
        const type = confirmNewPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmNewPasswordInput.setAttribute('type', type);
        document.getElementById('toggleConfirmNewPassword').textContent = type === 'password' ? '👁️' : '🔐'; 
    });

    document.querySelector('#saveWorkerButton').onclick = async () => {
        const token = localStorage.getItem('token');
        const updatedWorker = {
            name: document.querySelector('#updateWorkerName').value,
            phone: document.querySelector('#updateWorkerPhone').value,
        };
        const oldPassword = document.querySelector('#oldPassword').value;
        const newPassword = document.querySelector('#newPassword').value;
        const confirmNewPassword = document.querySelector('#confirmNewPassword').value;

        const formData = new FormData();
        if (oldPassword && newPassword && confirmNewPassword) {
            if (newPassword !== confirmNewPassword) {
                alert("New passwords do not match.");
                return;
            }
            formData.append('oldPassword', oldPassword);
            formData.append('newPassword', newPassword);
        }


        formData.append('name', updatedWorker.name);
        formData.append('phone', updatedWorker.phone);
        const imageFile = document.querySelector('#updateWorkerImage').files[0];
        if (imageFile) {
            formData.append('picture', imageFile);
        }

        try {
            const response = await axios.put(`${baseUrl}/user/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const pictureUrl = response.data.pictureUrl;
            const fullUrl = `${baseUrl}${pictureUrl}`;
            localStorage.setItem('myPicture', fullUrl);
            closeModal(backdrop, modal);
            location.reload();
        } catch (error) {
            console.log('Error updating worker: ', error);
        }
    };

    document.getElementById('cancelUpdateButton').onclick = () => closeModal(backdrop, modal);
}

function closeModal(backdrop, modal) {
    document.body.removeChild(backdrop);
    document.body.removeChild(modal);
    document.body.style.overflow = 'auto';
}

let inactivityTimers = {};
let currentSocket;
const username = localStorage.getItem('name') || 'Worker';
const maxChats = 4;
let openChats = [];

document.querySelector('#openConversation').addEventListener('click', async () => {
    if (openChats.length >= maxChats) {
        alert('Maximum number of chats opened. Please close a chat to open a new one.');
        return;
    }
    const chatWindow = document.createElement('div');
    document.querySelector("#openConversation").disabled = true;
    try {
        const url = `${baseUrl}/conversation`;
        const token = localStorage.getItem('token');
        const response = await axios.post(url, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const conversationId = response.data.queueId;
        const topic = response.data.topic;

        if (!conversationId) {
            console.error('Conversation ID or topic is not defined.');
            return;
        }

        openChats.push(conversationId);

        chatWindow.classList.add('chat-window');
        const date = new Date().toLocaleString();

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

        const messageInput = document.querySelector(`#messageInput_${conversationId}`);
        const sendMessageButton = document.querySelector(`#sendMessageButton_${conversationId}`);
        const closeChatButton = document.querySelector(`#closeChatButton_${conversationId}`);

        if (!currentSocket || currentSocket.readyState === WebSocket.CLOSED) {
            currentSocket = new WebSocket(`${ws}`);


            currentSocket.addEventListener('open', () => {
                const connectMessage = {
                    type: 'join_conversation',
                    conversationId: conversationId,
                    username: username,
                    role: 'worker',
                    timestamp: new Date().toISOString(),
                    workerPictureUrl: localStorage.getItem('myPicture'),
                };
                currentSocket.send(JSON.stringify(connectMessage));
            });


            currentSocket.addEventListener('message', (event) => {
                const message = JSON.parse(event.data);
                console.log('Received:', message);
                const pingSound = new Audio("/public/ping.mp3");
                if (message.type === 'message' && openChats.includes(message.conversationId)) {
                    const chatMessages = document.querySelector(`#chatMessages_${message.conversationId}`);
                    if (message.username!=localStorage.getItem('name'))
                            pingSound.play();
                    if (chatMessages) {
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
                        resetInactivityTimer(message.conversationId);
                    }
                } else if (message.type === 'chat_closed' && openChats.includes(message.conversationId)) {
                    closeChat(message.conversationId);
                }
            });


            currentSocket.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
            });

            currentSocket.addEventListener('close', () => {
                console.log('WebSocket connection closed');
            });
        }


        sendMessageButton.addEventListener('click', async () => {
            const message = messageInput.value.trim();
            if (message && currentSocket && currentSocket.readyState === WebSocket.OPEN) {
                const messageToSend = {
                    type: 'message',
                    conversationId: conversationId,
                    content: message,
                    username: username,
                    recipientUsername: username,
                    timestamp: new Date().toISOString(),
                    role: "worker",
                };
                currentSocket.send(JSON.stringify(messageToSend));


                const converContent = [{
                    description: message,
                    writer: "worker", 
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
        });

        startInactivityTimer(conversationId);

    } catch (error) {
        document.querySelector('#message').innerText = " queue is empty.";
        console.log('Error fetching conversation:', error.message);
    }
});

function closeChat(conversationId) {
    const index = openChats.indexOf(conversationId);
    if (index > -1) {
        openChats.splice(index, 1); 
    }

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

    clearTimeout(inactivityTimers[conversationId]);
    delete inactivityTimers[conversationId];
    location.reload();

}

function resetInactivityTimer(conversationId) {
    clearTimeout(inactivityTimers[conversationId]);
    startInactivityTimer(conversationId);
}

function startInactivityTimer(conversationId) {
    inactivityTimers[conversationId] = setTimeout(() => {
        closeChat(conversationId);
    }, 1 * 60 * 1000); 
}

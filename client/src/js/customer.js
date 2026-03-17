import axios from 'axios';
import { baseUrl } from './config';
import { ws } from './config';

window.onload = async () => {
    let permission=localStorage.permission;
        if(permission!=="customer"){
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
    document.querySelector('#gifContainer').style.display='block';
    document.querySelector("#viewConversation").disabled = false;
    document.querySelector("#updateForm").disabled = false;
}

document.querySelector('#logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '.../index.html';
});

document.querySelector('#newConversation').addEventListener('click', () => {
    document.getElementById('topicInputDiv').style.display = 'block';
    document.getElementById('newConversation').style.display = 'none';
    document.querySelector('#gifContainer').style.display='none';
    document.querySelector("#viewConversation").disabled = true;
    document.querySelector("#updateForm").disabled = true;
});


const viewConversation = async () => {
    document.querySelector('#gifContainer').style.display = 'none';
    document.querySelector('#container').style.display = 'block';
    document.querySelector("#newConversation").disabled = true;
    document.querySelector("#updateForm").disabled = true;
    document.querySelector("#viewConversation").disabled = true;
    let conversationsTable;
    if (document.querySelector('#conversationsTable') == undefined) {
        conversationsTable = document.createElement('table');
        conversationsTable.id = 'conversationsTable';
    }
    conversationsTable.innerHTML = `<tbody id="conversationsBody"></tbody>`;

    document.body.appendChild(conversationsTable);
    let url = `${baseUrl}/conversation/${localStorage.email}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
        const conversationsBody = document.getElementById('conversationsBody');
        conversationsBody.innerHTML = ''; 

        if (response.data.length === 0) {
            conversationsBody.innerHTML = '<h3>No conversations found.</h3>';
        }else {
            conversationsTable.classList.add('show'); 
            response.data.forEach(conver => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${conver.emailCustomer}</td>
                    <td>${conver.emailWorker}</td>
                    <td>${new Date(conver.date).toLocaleString()}</td>
                    <td>${conver.topic}</td>
                    <td><button class="action-button" data-id="${conver._id}">View</button></td>
                `;
                conversationsBody.appendChild(row);
            });
            const actionButtons = document.querySelectorAll('.action-button');
            actionButtons.forEach(button => {
                button.onclick = async () => {
                    const converId = button.getAttribute('data-id');
                    conversationsTable.remove();
                    const returnButton = document.createElement('button');
                    returnButton.id = "backB";
                    returnButton.textContent = 'Back to Conversations';
                    returnButton.onclick = () => {
                         document.getElementById('users').style.display = 'none';
                         document.querySelector('#message').innerText = '';
                        returnButton.remove();
                        viewConversation()
                    };

                    document.body.appendChild(returnButton);

                    try {
                        const response = await axios.post(`${baseUrl}/conversation/${converId}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.token}`
                            }
                        });
                        if(response.data.converContent.length!==0)
                            displayConversationDetails(response.data);
                        else
                            document.querySelector('#message').innerText = "Not found conversation content.";

                    } catch (error) {

                        console.error('Error fetching conversation details:', error);
                    }
                };
            });
        }
            
        }
     catch (error) {
        console.error('Error loading conversations:', error);

        document.querySelector('#message').innerText = "Not found conversations.";
    }
}
document.querySelector('#viewConversation').addEventListener('click', viewConversation);

function displayConversationDetails(conversation) {
    document.getElementById('users').style.display = 'flex';

    const detailsContainer = document.getElementById('users');
    detailsContainer.innerHTML=``;
    detailsContainer.innerHTML = `
        <div class="chat-window">
            <div class="chat-header">
                <h3>Topic: ${conversation.topic}</h3>
                <p>Date: ${conversation.date}</p>
            </div>
            <div class="chat-messages">
                ${conversation.converContent.map(content => `
                    <div class="chat-message ${content.writer === 'worker' ? 'worker' : 'customer'}">
                        <img src="${content.writer === 'worker' ? `${baseUrl}${conversation.workerPictureUrl}` : `${baseUrl}${conversation.customerPictureUrl}`}" alt="${content.writer} Avatar">
                        <p>${content.description}</p>
                        <span class="timestamp">${new Date(content.time).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

let currentSocket = null;
let isChatOpen = false;
let inactivityTimer;
let topic;

const waitSound = new Audio("/public/BB001.WAV");
document.getElementById('submitTopic').addEventListener('click', async () => {
    document.querySelector('#gifContainer').style.display='none';
    document.querySelector("#viewConversation").disabled = true;
    document.querySelector("#updateForm").disabled = true;
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
                const pingSound = new Audio("/public/ping.mp3");
                if (message.type === 'worker_joined' && message.message !== `${username} has joined the conversation.`) {
                    waitSound.pause();
                    openChatWindow(conversationId);
                } else if (message.type === 'message' && message.conversationId === conversationId ) {
                    if(message.username!=localStorage.getItem('name'))
                        pingSound.play();
                    const chatMessages = document.querySelector(`#chatMessages_${conversationId}`);
                    const messageDiv = document.createElement('div');
                    const pictureUrl = message.pic;
            
                    if (message.username === username) {
                        messageDiv.innerHTML = `
                            <div class="chat-message">
                                <img src="${pictureUrl}" alt="${message.username}" />
                                <div>
                                    <p>${message.content}</p>
                                    <span class="timestamp">Time: ${new Date(message.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        `;
                    } else {
                        messageDiv.innerHTML = `
                            <div class="chat-message user-message">
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

function showWaitingMessage(conversationId) {
    waitSound.loop = true;
    waitSound.play();
    const waitingMessageContainer = document.createElement('div');
    waitingMessageContainer.id = `waitingMessage_${conversationId}`;
    waitingMessageContainer.className = 'waiting-message';
    waitingMessageContainer.innerHTML = `
        <img id="connect" src="/public/img/connect.gif" alt="Waiting..." />
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
    document.querySelector('#gifContainer').style.display='block';
    location.reload();

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







import axios from 'axios';
import { baseUrl } from './config';

document.getElementById('addWorker').addEventListener('click', () => {
    addWorker();
    document.querySelector("#addWorker").disabled = true;
    document.querySelector("#updateMyData").disabled = true;
    document.querySelector("#getU").disabled = true;
    document.querySelector("#getConversations").disabled = true;
    document.querySelector("#loadWorkersButton").disabled = true;
});

document.querySelector('#logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '.../index.html';
});

function addWorker() {
    const div = document.querySelector("#elements")
    const form = document.createElement('form');
    form.id = 'addWorkerForm';
    const title = document.createElement('h1');
    title.textContent = 'Add Worker'; 
    form.appendChild(title); 
    form.innerHTML += `
        <input type="email" id="workerEmail" placeholder="Email" required />
        <input type="text" id="workerName" placeholder="Name" />
        <input type="text" id="workerPhone" placeholder="Phone" />
        <div id="pass" style="position: relative;">
            <input type="password" id="workerPassword" placeholder="Password" required />
            <button type="button" id="togglePassword" style="position: absolute; right: 10px; top: 40%; transform: translateY(-50%); border: none; background: none; cursor: pointer;">👁️</button>
        </div>
        <div style="display: flex; align-items: center;">
            <input type="file" id="picture" accept="image/*" style="display: none;"> <!-- Hide the default file input -->
            <button type="button" id="uploadButton" style="margin-right: 10px;">Choose picture</button>
            <span id="icon" style="font-size: 20px;"></span> <!-- Placeholder for the check icon -->
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <button type="submit">Add Worker</button>
            <button type="button" id="closeForm">Close</button>
        </div>
    `;

    document.body.appendChild(form); 
    document.getElementById('uploadButton').addEventListener('click', () => {
        document.getElementById('picture').click(); 
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const picture = document.getElementById('picture').files[0];
        const newWorker = new FormData();
        newWorker.append('email', document.getElementById('workerEmail').value);
        newWorker.append('name', document.getElementById('workerName').value);
        newWorker.append('phone', document.getElementById('workerPhone').value);
        newWorker.append('password', document.getElementById('workerPassword').value);
        if (picture) {
            newWorker.append('picture', picture);
        }
        try {
            const response = await axios.post(`${baseUrl}/user/add`, newWorker, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                     Authorization: `Bearer ${localStorage.token}`
                }
            });
            document.body.removeChild(form); 
        } catch (error) {
            alert('Error adding worker: ' + error.message);
        }
        document.querySelector("#addWorker").disabled = false;
        document.querySelector("#updateMyData").disabled = false;
        document.querySelector("#getU").disabled = false;
        document.querySelector("#getConversations").disabled = false;
        document.querySelector("#loadWorkersButton").disabled = false;
    });

    document.getElementById('closeForm').addEventListener('click', () => {
        document.body.removeChild(form);
        document.querySelector("#addWorker").disabled = false;
    document.querySelector("#updateMyData").disabled = false;
    document.querySelector("#getU").disabled = false;
    document.querySelector("#getConversations").disabled = false;
    document.querySelector("#loadWorkersButton").disabled = false;
    });


    document.getElementById('togglePassword').addEventListener('click', () => {
        const passwordInput = document.getElementById('workerPassword');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        document.getElementById('togglePassword').textContent = type === 'password' ? '👁️' : '🔐';
    });


    document.getElementById('picture').addEventListener('change', function() {
        const icon = document.getElementById('icon');
        if (this.files.length > 0) {
            icon.innerHTML = '✔'; 
        } else {
            icon.innerHTML = ''; 
        }
    });
}


async function loadWorkers() {
    document.querySelector("#addWorker").disabled = true;
    document.querySelector("#updateMyData").disabled = true;
    document.querySelector("#getU").disabled = true;
    document.querySelector("#getConversations").disabled = true;
    document.querySelector("#loadWorkersButton").disabled = true;
    let workersContainer = document.createElement('div');
    let workersTable = document.querySelector('#workersTable');

    if (!workersTable) {
        workersTable = document.createElement('table');
        workersTable.id = 'workersTable';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['My pic', 'Email', 'Name', 'Phone', 'Actions'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        workersTable.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.id = 'workersBody';
        workersTable.appendChild(tbody);
        workersContainer.appendChild(workersTable);
        document.body.appendChild(workersContainer);
    }

    const workersBody = document.getElementById('workersBody');

    try {
        const response = await axios.post(`${baseUrl}/user`, { permission: "worker" }, {
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            }
        });

        workersBody.innerHTML = '';

        response.data.forEach(worker => {
            const pictureUrl = worker.pictureUrl;
            const fullUrl = `${baseUrl}${pictureUrl}`;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${fullUrl}" alt="${worker.name}'s picture" style="width: 50px; height: 50px;"/></td>
                <td>${worker.email}</td>
                <td>${worker.name}</td>
                <td>${worker.phone}</td>
                <td></td> <!-- Placeholder for action buttons -->
            `;

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.addEventListener('click', () => deleteWorker(worker.email));

            const updateButton = document.createElement('button');
            updateButton.innerText = 'Update';
            updateButton.addEventListener('click', () => createUpdateForm(worker.email, worker.name, worker.phone, worker.pictureUrl));

            const actionsCell = row.querySelector('td:last-child');
            actionsCell.appendChild(deleteButton);
            actionsCell.appendChild(updateButton);
            workersBody.appendChild(row);
        });
    } catch (error) {
        console.log('Error loading workers:', error);
    }
}

document.getElementById('loadWorkersButton').addEventListener('click', loadWorkers);

async function getUser(data) {
    document.querySelector("#addWorker").disabled = true;
    document.querySelector("#updateMyData").disabled = true;
    document.querySelector("#getU").disabled = true;
    document.querySelector("#getConversations").disabled = true;
    document.querySelector("#loadWorkersButton").disabled = true;
    try {
        const response = await axios.post(`${baseUrl}/user`, data,{
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            }
        });
        const users = response.data;
        const usersContainer = document.querySelector('#users');
        usersContainer.innerHTML = '';
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user');
            const pictureUrl = user.pictureUrl;
            const fullUrl = `${baseUrl}${pictureUrl}`;
            userDiv.innerHTML = `
                <img src="${fullUrl}" alt="${user.name}'s picture" style="width: 50px; height: 50px;"/>
                <h3>${user.name}</h3>
                <p>Email: ${user.email}</p>
                <p>Phone: ${user.phone}</p>
                <p>Permission: ${user.permission}</p>
            `;
            usersContainer.appendChild(userDiv);
        });
    }
    catch (error) {
        console.log('Error axiosing users:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('#getU');
    button.addEventListener('click', function() {
        getUser({ permission: "customer" }); 
    });
});

async function deleteWorker(email) {
    try {
        await axios.delete(`${baseUrl}/user/${email}`,{
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            }
        });
        loadWorkers();
    } catch (error) {
        alert('Error deleting worker: ' + error.response.data.error.message);
    }
}

function closeModal(backdrop, modal) {
    document.body.removeChild(backdrop);
    document.body.removeChild(modal);
    document.querySelector("#addWorker").disabled = false;
    document.querySelector("#updateMyData").disabled = false;
    document.querySelector("#getU").disabled = false;
    document.querySelector("#getConversations").disabled = false;
    document.querySelector("#loadWorkersButton").disabled = false;
}

window.onload = () => {
    let permission=localStorage.permission;
        if(permission!=="admin"){
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

function createUpdateForm(email, name, phone, picture) {
    document.querySelector("#addWorker").disabled = true;
    document.querySelector("#updateMyData").disabled = true;
    document.querySelector("#getU").disabled = true;
    document.querySelector("#getConversations").disabled = true;
    document.querySelector("#loadWorkersButton").disabled = true;
    document.querySelector('#workersTable').style.display = 'none';
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.textAlign = 'center';

    const imageContainer = document.createElement('div');
    imageContainer.style.display = 'flex';
    imageContainer.style.flexDirection = 'column'; 
    imageContainer.style.alignItems = 'center'; 

    const imageElement = document.createElement('img');
    imageElement.src = `${baseUrl}${picture}`;
    imageElement.alt = `${name}'s picture`;
    imageElement.style.width = '100px';
    imageElement.style.height = '100px';
    imageElement.id = "profilePicture";
    imageElement.style.borderRadius = '50%'; 

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.id = 'updateWorkerImage';
    inputFile.accept = 'image/*';
    inputFile.style.display = 'none'; 

    const addPictureButton = document.createElement('button');
    addPictureButton.innerText = 'Add Picture';
    addPictureButton.onclick = () => inputFile.click(); 

    
    imageContainer.appendChild(imageElement);
    imageContainer.appendChild(addPictureButton);
    modal.appendChild(imageContainer);

    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.placeholder = 'Name';
    inputName.value = name;

    const inputPhone = document.createElement('input');
    inputPhone.type = 'text';
    inputPhone.placeholder = 'Phone';
    inputPhone.value = phone;

    const saveButton = document.createElement('button');
    saveButton.id = 'saveWorkerButton';
    saveButton.innerText = 'Save';

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancelUpdateButton';
    cancelButton.innerText = 'Cancel';

    modal.appendChild(inputFile);
    modal.appendChild(inputName);
    modal.appendChild(inputPhone);
    modal.appendChild(saveButton);
    modal.appendChild(cancelButton);

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    inputFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageElement.src = e.target.result;
                addPictureButton.innerHTML += ' ✔'; 
            };
            reader.readAsDataURL(file);
        }
    });

    saveButton.onclick = async () => {
        const updatedWorker = {
            name: inputName.value,
            phone: inputPhone.value,
        };

        const imageInput = document.getElementById('updateWorkerImage');
        if (imageInput.files.length > 0) {
            const formData = new FormData();
            formData.append('picture', imageInput.files[0]);
            formData.append('data', JSON.stringify(updatedWorker));

            try {
                await axios.put(`${baseUrl}/user/${email}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.token}`
                    }
                });
                document.querySelector('#workersTable').style.display = 'block';
                loadWorkers();
            } catch (error) {
                console.log('Error updating worker: ', error);
            }
        } else {
            try {
                await axios.put(`${baseUrl}/user/${email}`, updatedWorker, {
                    headers: {
                        Authorization: `Bearer ${localStorage.token}`
                    }
                });
                document.querySelector('#workersTable').style.display = 'block';
                loadWorkers();
            } catch (error) {
                console.log('Error updating worker: ', error);
            }
        }

        closeModal(backdrop, modal);
    };

    cancelButton.onclick = () => {
        closeModal(backdrop, modal);
    };
}

document.getElementById('updateMyData').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await axios.post(`${baseUrl}/user/token`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const worker = response.data;
            createMyUpdateForm(worker.email, worker.name, worker.phone,worker.pictureUrl);
        } catch (error) {
            console.log('Error fetching worker data: ' + (error.response?.data?.msg || error.message));
        }
    } else {
        console.log('Error fetching worker data: No token found');
    }
});

function createMyUpdateForm(email, name, phone, picture) {
    document.querySelector("#addWorker").disabled = true;
    document.querySelector("#updateMyData").disabled = true;
    document.querySelector("#getU").disabled = true;
    document.querySelector("#getConversations").disabled = true;
    document.querySelector("#loadWorkersButton").disabled = true;
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div style="text-align: center;">
            <img id="profilePicture" src='${baseUrl}${picture}' alt="${name}'s picture" style="width: 100px; height: 100px; border-radius: 50%; display: inline-block;" />
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
            alert('Worker updated successfully');
            const pictureUrl = response.data.pictureUrl;
            const fullUrl = `${baseUrl}${pictureUrl}`;
            localStorage.setItem('myPicture', fullUrl);
            closeModal(backdrop, modal);
            location.reload();
        } catch (error) {
            console.log('Error updating worker: ', error);
        }
        document.querySelector("#addWorker").disabled = false;
        document.querySelector("#updateMyData").disabled = false;
        document.querySelector("#getU").disabled = false;
        document.querySelector("#getConversations").disabled = false;
        document.querySelector("#loadWorkersButton").disabled = false;
    };

    document.getElementById('cancelUpdateButton').onclick = () => closeModal(backdrop, modal);
}

document.querySelector('#getConversations').addEventListener('click', () => {
    document.querySelector("#addWorker").disabled = true;
    document.querySelector("#updateMyData").disabled = true;
    document.querySelector("#getU").disabled = true;
    document.querySelector("#getConversations").disabled = true;
    document.querySelector("#loadWorkersButton").disabled = true;
    createConversationFilter();
});


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


function createConversationFilter() {
    let conversationsTable = document.getElementById('conversationsTable');
    if (!conversationsTable) {
        conversationsTable = document.createElement('table');
        conversationsTable.id = 'conversationsTable';
    }

    conversationsTable.innerHTML = `
        <tbody id="conversationsBody"></tbody>
    `;

    if (!document.body.contains(conversationsTable)) {
        document.body.appendChild(conversationsTable);
    }

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';

    const title = document.createElement('h1');
    title.textContent = 'Filter Conversation';

    const emailCustomerInput = document.createElement('input');
    emailCustomerInput.type = 'text';
    emailCustomerInput.placeholder = 'Enter Email Customer';
    emailCustomerInput.className = 'input';

    const emailWorkerInput = document.createElement('input');
    emailWorkerInput.type = 'text';
    emailWorkerInput.placeholder = 'Enter Email Worker';
    emailWorkerInput.className = 'input';

    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.placeholder = 'Enter Date yyyy-mm-dd';
    dateInput.className = 'input';

    const topicInput = document.createElement('input');
    topicInput.type = 'text';
    topicInput.placeholder = 'Enter Topic';
    topicInput.className = 'input';

    const getConversationsButton = document.createElement('button');
    getConversationsButton.id = 'getConversations';
    getConversationsButton.textContent = 'Get Conversations';

    const exitb = document.createElement('button');
    exitb.textContent = 'back';
    exitb.onclick = () => {
        filterContainer.remove(); 
        buttunM.remove(); 
        document.querySelector("#addWorker").disabled = false;
    document.querySelector("#updateMyData").disabled = false;
    document.querySelector("#getU").disabled = false;
    document.querySelector("#getConversations").disabled = false;
    document.querySelector("#loadWorkersButton").disabled = false;
    };
document.querySelector("#users").style.display="none"
    const buttunM = document.createElement('div');
    buttunM.id = 'buttunM';
    buttunM.append(getConversationsButton);
    buttunM.append(exitb);
   

    filterContainer.appendChild(title);
    filterContainer.appendChild(emailCustomerInput);
    filterContainer.appendChild(emailWorkerInput);
    filterContainer.appendChild(dateInput);
    filterContainer.appendChild(topicInput);
    filterContainer.appendChild(buttunM);
    document.body.appendChild(filterContainer)


    getConversationsButton.onclick = async () => {
        let url = `${baseUrl}/conversation?`;
        const emailCustomerInputValue = emailCustomerInput.value;
        const emailWorkerInputValue = emailWorkerInput.value;
        const dateInputValue = dateInput.value;
        const topicInputValue = topicInput.value;

        if (emailCustomerInputValue) {
            url += `emailCustomer=${emailCustomerInputValue}&`;
        }
        if (emailWorkerInputValue) {
            url += `emailWorker=${emailWorkerInputValue}&`;
        }
        if (dateInputValue) {
            url += `date=${dateInputValue}&`;
        }
        if (topicInputValue) {
            url += `topic=${topicInputValue}&`;
        }

        url = url.replace(/&$/, '');

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.token}`
                }
            });
            filterContainer.remove();
            const conversationsBody = document.getElementById('conversationsBody');
            conversationsBody.innerHTML = ''; 
            

            if (response.data.length === 0) {
                conversationsBody.innerHTML = '<tr><td colspan="5">No conversations found.</td></tr>';
            } else {
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

                const underTableButton = document.createElement('button');
                underTableButton.textContent = 'Back to filter';
                const exit = document.createElement('button');
                exit.textContent = 'exit';
                

                underTableButton.onclick = () => {
                    conversationsTable.remove(); 
                    underTableButton.remove(); 
                    createConversationFilter();
                    exit.remove();
                };

                exit.onclick = () => {
                    conversationsTable.remove(); 
                    exit.remove(); 
                    underTableButton.remove();
                    document.querySelector("#addWorker").disabled = false;
                    document.querySelector("#updateMyData").disabled = false;
                    document.querySelector("#getU").disabled = false;
                    document.querySelector("#getConversations").disabled = false;
                    document.querySelector("#loadWorkersButton").disabled = false;
                    document.querySelector('#message').innerText ='';
                };
                

                const buttunM = document.createElement('div');
                buttunM.id = 'buttunM';
                buttunM.append(underTableButton);
                buttunM.append(exit);

                document.body.appendChild(buttunM);

                const actionButtons = document.querySelectorAll('.action-button');
                actionButtons.forEach(button => {
                    button.onclick = async () => {
                        underTableButton.remove();
                            exit.remove();
                            conversationsTable.remove(); 
                        const converId = button.getAttribute('data-id');
   
                        conversationsBody.innerHTML = '';

                        const returnButton = document.createElement('button');
                        returnButton.id = "backB";
                        returnButton.textContent = 'exit';
                        returnButton.onclick = () => {
                            
                            users.innerHTML = ''; 
                            conversationsTable.style.display = 'block'; 
                            returnButton.remove(); 
                            location.reload();
                        };
                        document.body.append(returnButton);

                        try {
                            const response = await axios.post(`${baseUrl}/conversation/${converId}`, {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.token}`
                                }
                            });
                            if (response.data.converContent.length !== 0) {
                                exit.remove();
                                underTableButton.remove();
                                displayConversationDetails(response.data);
                            } else {
                                document.querySelector('#message').innerText = "Not found conversation content.";
                            }
                        } catch (error) {
                            console.error('Error fetching conversation details:', error);
                        }
                    };
                });
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            document.querySelector('#message').innerText = "Not found conversations.";
        }
    };
}


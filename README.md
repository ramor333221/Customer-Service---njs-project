# 🎧 Customer Service System - Full Stack Project

A comprehensive real-time customer support platform built with **Node.js**, **Express**, **MongoDB**, and **WebSockets**. This system facilitates seamless interaction between customers and support agents with a managed queue system.

## 🚀 Key Features

### 💻 Backend (Server)
- **Real-time Chat:** Powered by WebSockets (`ws`) for instant messaging and status updates (joins/leaves).
- **Authentication:** Secure user sessions using **JWT (JSON Web Tokens)** and password hashing with **Bcrypt**.
- **Role-Based Access (RBAC):** Distinct permissions for **Customers**, **Workers**, and **Admins**.
- **Queue Management:** A logical waiting list system for customers based on topics.
- **Data Persistence:** Comprehensive MongoDB schemas for users, conversations, and queues.

### 🌐 Frontend (Client)
- **Interactive UI:** Dynamic interfaces for different user roles.
- **Live Communication:** Integrated WebSocket client for real-time support.
- **Profile Management:** Support for profile picture uploads and data updates.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Real-time:** WebSockets (`ws`)
- **Validation:** Joi
- **Frontend Tooling:** Vite (JavaScript)

---

## 📂 Project Structure

```text
/CustomerService
  ├── /client          # Frontend assets and logic (Vite)
  └── /server          # Backend API and WebSocket logic
        ├── /models    # Database Schemas
        ├── /sockets   # WebSocket server configuration
        └── /uploads   # User profile pictures

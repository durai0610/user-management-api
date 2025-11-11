# 📘 User Management API

## 🧩 Objective

Develop a Node.js application that exposes four RESTful API endpoints for user management — including creating, retrieving, updating, and deleting users — with proper validation, error handling, logging, and modular structure.

---

# 🚀 Features

* Create, retrieve, update, and delete users

* SQLite database integration

* UUID-based user IDs

* Validation for PAN, mobile, and manager status

* Centralized logging with morgan + file logging

* Modular architecture with reusable utilities

* Proper error handling and meaningful responses

---

# 🗂 Folder Structure

```text 
user-management-api/
│
├── controllers/
│   └── userController.js
│
├── db/
│   └── db.js
│
├── data/
│   └── app.db
│
├── logs/
│   ├── combined.log
│   └── error.log
│
├── routes/
│   └── userRoutes.js
│
├── utils/
│   ├── logger.js
│   └── validators.js
│
├── server.js
├── package.json
└── README.md

```

# 🛠️ Setup & Installation

1. Clone or extract the project

```bash
cd user-management-api
```

2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
npm start
```
or

```bash
node server.js
```

4. Server Output

✅ Database initialized

🚀 Server running on port 3000

---

5. The API will be live at

👉 http://localhost:3000

---

# 🧱 Database Schema

### **Table: users**

| Column Name | Type | Description |
|--------------|------|-------------|
| `user_id` | TEXT | Unique user identifier (UUID v4) |
| `full_name` | TEXT | Full name of the user |
| `mob_num` | TEXT | 10-digit mobile number |
| `pan_num` | TEXT | PAN number (validated to follow standard format) |
| `manager_id` | TEXT | Manager’s ID (optional field) |
| `created_at` | TEXT | Timestamp when the user was created |
| `updated_at` | TEXT | Timestamp when the user was last updated |

---

# 📡 API Endpoints

| Method | Endpoint | Description | Request Body | Success Response |
|---------|-----------|--------------|---------------|------------------|
| **POST** | `/create_user` | Creates a new user record in the database | ```json { "full_name": "John Doe", "mob_num": "9876543210", "pan_num": "ABCDE1234F", "manager_id": "M001" } ``` | ```json { "success": true, "message": "User created successfully", "data": { "user_id": "generated-uuid" } } ``` |
| **POST** | `/get_users` | Retrieves all user records from the database | _No body required_ | ```json { "success": true, "data": [ { "user_id": "...", "full_name": "...", "mob_num": "...", "pan_num": "...", "manager_id": "...", "created_at": "...", "updated_at": "..." } ] } ``` |
| **POST** | `/update_user` | Updates an existing user using `user_id` | ```json { "user_id": "existing-uuid", "full_name": "Jane Doe", "mob_num": "9123456789", "pan_num": "WXYZE9876G" } ``` | ```json { "success": true, "message": "User updated successfully" } ``` |
| **POST** | `/delete_user` | Deletes a user from the database using `user_id` | ```json { "user_id": "existing-uuid" } ``` | ```json { "success": true, "message": "User deleted successfully" } ``` |

---

# 🧾 Logging

* All requests are logged using Morgan

* Errors and warnings are logged into:

    * `logs/combined.log`

    * `logs/error.log`

---

# 🧠 Error Handling

Every endpoint includes:

* Missing field checks

* Validation failure messages

* Database error responses

* Proper status codes (`400`, `404`, `500`)

---

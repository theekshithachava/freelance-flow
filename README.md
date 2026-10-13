# Freelancer Project Management System

A full-stack **Freelancer Project Management System** built using the **MERN stack**. The application helps freelancers manage clients, projects, tasks, deadlines, milestones, payments, and invoices from one centralized platform.

## 📌 Project Overview

Freelancers often manage their work using multiple applications for client information, project tracking, task management, deadlines, invoices, and payments. This can make it difficult to keep everything organized.

The **Freelancer Project Management System** provides a centralized solution where freelancers can manage their complete project workflow in one place.

The system allows freelancers to:

- Manage clients
- Create and manage projects
- Track tasks and milestones
- Monitor project deadlines
- Track project progress
- Manage payments
- Generate invoices
- View project and financial information
- Manage client communication
- Track completed and ongoing projects

## 🎯 Problem Statement

Freelancers commonly face difficulties in managing multiple clients and projects simultaneously.

Some major problems include:

- Scattered client information
- Difficulty tracking project progress
- Missed task deadlines
- Poor organization of project milestones
- Difficulty monitoring payments
- Manual invoice management
- Lack of a centralized dashboard
- Time-consuming project tracking

Our system addresses these problems by providing a **single platform for complete freelancer project management**.

## 💡 Proposed Solution

The proposed system is a web-based application that centralizes all important freelancer activities.

Instead of using different tools for different purposes, freelancers can use one platform to:

**Client → Project → Tasks → Deadlines → Milestones → Invoice → Payment**

This makes project management more organized, transparent, and efficient.

## ✨ Features

### 👤 User Authentication

- User registration
- User login
- Secure authentication
- Logout functionality
- Role-based access
- Freelancer and Client roles

### 👥 Client Management

- Add new clients
- Edit client information
- Delete clients
- View client details
- Search and filter clients
- View projects associated with each client

### 📁 Project Management

- Create projects
- Edit project details
- Delete projects
- Set project budgets
- Set start and end dates
- Assign clients
- Track project status
- Monitor project progress

### ✅ Task Management

- Create tasks
- Update tasks
- Delete tasks
- Assign tasks to projects
- Set task priorities
- Set deadlines
- Track task status

Task statuses can include:

- To Do
- In Progress
- Review
- Completed

### 🏁 Milestone Management

- Create project milestones
- Set milestone deadlines
- Track milestone completion
- Monitor project progress
- Associate milestones with projects

### 📅 Deadline Tracking

- View upcoming deadlines
- Track overdue tasks
- Monitor project completion dates
- Organize important dates

### 💰 Payment Management

- Record payments
- Track paid amounts
- Track pending payments
- Track overdue payments
- View payment history
- Associate payments with projects

### 🧾 Invoice Management

- Create invoices
- Add project and client information
- Add services/items
- Calculate total amount
- Track invoice status
- Download or print invoices

### 📊 Dashboard

The dashboard provides an overview of:

- Total clients
- Active projects
- Completed projects
- Pending tasks
- Upcoming deadlines
- Total revenue
- Pending payments
- Recent activities

### 📈 Project Progress

Projects can be monitored using:

- Progress percentage
- Task completion
- Milestone completion
- Project status
- Deadline information

### 🔔 Notifications

The system can notify users about:

- Upcoming deadlines
- Overdue tasks
- Payment due dates
- Project updates
- Milestone updates

# 🏗️ System Architecture

The application follows a **three-tier architecture** using the MERN stack.

```text
              ┌─────────────────────┐
              │       User          │
              │ Freelancer / Client │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   React Frontend    │
              │       + UI          │
              └──────────┬──────────┘
                         │
                    REST API
                         │
                         ▼
              ┌─────────────────────┐
              │ Node.js + Express   │
              │      Backend        │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │      MongoDB        │
              │      Database       │
              └─────────────────────┘
```

# 🛠️ Technology Stack

## Frontend

- React.js
- HTML5
- CSS3
- JavaScript
- Tailwind CSS / CSS
- Axios
- React Router

## Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

## Database

- MongoDB
- Mongoose

## Development Tools

- Git
- GitHub
- Visual Studio Code
- Postman
- npm

# 📂 Project Structure

```text
freelancer-project-management/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── context/
│       ├── hooks/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── .env
├── .gitignore
└── README.md
```

# 🗄️ Database Models

## User

Stores user authentication and profile information.

## Client

Stores client details such as:

- Name
- Email
- Phone
- Company
- Address

## Project

Stores:

- Project name
- Description
- Client
- Budget
- Start date
- End date
- Status
- Progress

## Task

Stores:

- Task name
- Description
- Project
- Priority
- Status
- Deadline

## Milestone

Stores:

- Milestone name
- Project
- Deadline
- Status

## Payment

Stores:

- Project
- Amount
- Payment date
- Payment status
- Payment method

## Invoice

Stores:

- Invoice number
- Client
- Project
- Items
- Total amount
- Due date
- Invoice status

# 🔐 Authentication

The application uses **JWT-based authentication**.

Basic authentication flow:

```text
User Registration
       ↓
User Login
       ↓
Server validates credentials
       ↓
JWT Token Generated
       ↓
Token stored by frontend
       ↓
Authenticated API Requests
```

Passwords should be securely hashed using **bcrypt** before being stored in the database.

# 🔄 Application Workflow

```text
Register / Login
       ↓
Dashboard
       ↓
Add Client
       ↓
Create Project
       ↓
Create Milestones
       ↓
Create Tasks
       ↓
Track Progress
       ↓
Complete Project
       ↓
Generate Invoice
       ↓
Receive Payment
       ↓
Update Financial Records
```

# 🚀 Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/freelancer-project-management.git
```

Move into the project directory:

```bash
cd freelancer-project-management
```

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

## 3. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

## 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the values with your actual MongoDB connection string and secret key.

## 5. Start the Backend

Inside the `server` directory:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

## 6. Start the Frontend

Inside the `client` directory:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

# 🔌 API Modules

The backend can provide REST APIs for:

```text
/api/auth
/api/users
/api/clients
/api/projects
/api/tasks
/api/milestones
/api/payments
/api/invoices
/api/notifications
```

Example API operations:

```text
GET     /api/projects
POST    /api/projects
GET     /api/projects/:id
PUT     /api/projects/:id
DELETE  /api/projects/:id
```

The system follows standard **CRUD operations**:

- Create
- Read
- Update
- Delete

# 📊 Benefits

## For Freelancers

- Centralized project management
- Better organization
- Easier deadline tracking
- Improved task management
- Better payment tracking
- Simplified invoice management
- Reduced manual work

## For Clients

- Better project visibility
- Clear project progress
- Milestone tracking
- Transparent communication
- Easy access to invoices and payment information

# 🌟 Impact

The system can help freelancers improve their workflow by bringing important project information into a single platform.

It provides:

- Better organization
- Improved productivity
- Greater project visibility
- Better financial tracking
- Improved client experience
- More efficient project delivery

# 🔮 Future Scope

The project can be expanded with additional features in the future:

- AI-based project planning
- AI deadline prediction
- Automated email notifications
- Google Calendar integration
- Online payment gateway integration
- Mobile application
- Advanced analytics
- Team collaboration
- Cloud file storage
- Automated recurring invoices
- Client feedback and rating system
- Multi-language support

**Note:** These are future enhancements and are not part of the basic MERN implementation unless specifically developed.

# 🧪 Testing

The backend APIs can be tested using **Postman**.

Testing should cover:

- User registration
- User login
- Authentication
- Client CRUD
- Project CRUD
- Task CRUD
- Milestone CRUD
- Payment management
- Invoice generation
- Authorization and role-based access

# 🔒 Security

Security measures include:

- Password hashing using bcrypt
- JWT authentication
- Protected API routes
- Role-based authorization
- Environment variables for sensitive credentials
- Input validation
- Secure database access

# 🎓 Project Type

**Academic / Hackathon Project**

### Project Name

**Freelancer Project Management System**

### Technology

**MERN Stack**

### Main Purpose

To provide freelancers with a centralized platform for managing clients, projects, tasks, deadlines, milestones, invoices, and payments.

# 👩‍💻 Author

**Teekshitha**  
**Roll No:** 25MMVCSER0105  
**Class:** CSE-B

# 📜 License

This project is developed for educational and academic purposes.

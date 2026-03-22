# PrintFlow


PrintFlow is an innovative, full-stack digital queue management system designed to streamline operations, reduce customer wait times, and manage print jobs efficiently in a printing shop environment. It features real-time updates, role-based access, and an integrated wallet system for seamless transactions.

## Features

- **Role-Based Access Control:** Differentiated dashboards and permissions for Students, Staff, and Administrators.
- **Real-Time Queue Management:** Live updates for print job statuses and queue position using Socket.IO.
- **Student Wallet System:** Users can top up their wallet, and funds are automatically locked for job authorization and deducted upon completion.
- **Flexible Print Job Submission:**
    - Upload various file types (PDF, DOC/DOCX, images).
    - Configure print settings like color, double-sided, number of copies, and page range.
    - Choose between instant printing or scheduling for a later time.
- **Dedicated Dashboards:**
    - **Student:** Submit jobs, view job history, manage wallet, and see estimated wait times.
    - **Staff:** View and manage the live print queue, accept jobs, and update job statuses.
    - **Admin:** Monitor system-wide analytics, such as daily revenue.
- **Automated File Cleanup:** A background service automatically removes files associated with completed or failed jobs to conserve server space.
- **Anti-Crowding for Scheduled Jobs:** Limits the number of scheduled jobs within a given time slot to prevent backlogs.

## Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React, Vite, React Router, Axios, Socket.IO Client, CSS Custom Properties |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT (JSON Web Tokens) |
| **Real-time** | Socket.IO |
| **File Handling** | Multer |

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Ensure your MongoDB server is running)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the `backend` directory and add the following variables:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/print_queue_db
    JWT_SECRET=your_jwt_secret_key
    FRONTEND_URL=http://localhost:5173
    ```

4.  **Seed the database with initial user data:**
    This script will create default accounts for an admin, a staff member, and a student.
    ```bash
    node seed.js
    ```

5.  **Start the backend server:**
    ```bash
    npm start
    ```
    The backend server will be running on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_BASE_URL=http://localhost:5000
    ```

4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

### Demo Accounts

You can log in with the following accounts created by the seed script. The password for all accounts is `password123`.

- **Admin:** `admin@printflow.com`
- **Staff:** `staff@printflow.com`
- **Student:** `student@printflow.com`

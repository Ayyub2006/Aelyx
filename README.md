# Mini School ERP — Attendance Management System

A production-quality, responsive, and visually polished Mini School ERP application focused heavily on Attendance Management. Built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## 🚀 Features

- **Secure Authentication:** JWT-based authentication with bcrypt password hashing.
- **Role-Based Access Control:** Distinct roles for `ADMIN` and `TEACHER` with strictly enforced backend authorization.
- **Teacher & Student Management:** Full CRUD capabilities for administrators to manage school personnel and students.
- **Class Management:** Create classes and assign them to specific teachers.
- **Advanced Attendance Marking:** 
  - Intuitive interface for teachers to mark daily attendance.
  - Automatic duplicate prevention using MongoDB compound unique indexes.
  - Seamless "Edit Mode" integration for updating past attendance records.
- **Attendance Reporting & Analytics:**
  - Date-range filtering and class-specific reporting.
  - Real-time dashboard widgets showing total present, absent, and attendance percentages.
  - **Export to CSV** functionality for easy external record keeping.
- **Admin Dashboard:** A high-level overview of total students, classes, teachers, and today's attendance rate.

## 💻 Technology Stack

**Frontend:**
- React (Vite)
- React Router DOM (Protected & Role-based routing)
- Tailwind CSS v4 (Styling)
- Lucide React (Beautiful icons)
- Axios (API Client)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcryptjs
- CORS & dotenv

## 🛠️ Installation & Local Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v16+)
- MongoDB (running locally on `mongodb://localhost:27017` or via MongoDB Atlas)

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd mini-school-erp
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create a .env file based on the provided .env.example (or manually create one)
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://localhost:27017/mini-school-erp" >> .env
echo "JWT_SECRET=your_super_secret_jwt_key_123" >> .env
echo "NODE_ENV=development" >> .env

# Start the backend development server
npm run dev
```

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

### 5. Access the Application
- Open your browser and navigate to `http://localhost:5173`
- The backend API runs on `http://localhost:5000`

## 🧪 Testing the Application (User Guide)

1. **Initial Setup (Admin):**
   - The application does not come with pre-seeded users for security reasons. 
   - You can quickly register your first Admin by sending a `POST` request to `http://localhost:5000/api/auth/register` (using Postman or cURL) with `{ "name": "Admin", "email": "admin@school.com", "password": "password123", "role": "ADMIN" }`.
2. **Login:** Log in to the frontend using your newly created Admin credentials.
3. **Setup Data:** 
   - Navigate to **Teachers** and add a teacher.
   - Navigate to **Classes** and create a class, assigning the new teacher to it.
   - Navigate to **Students** and add a few students, linking them to the class.
4. **Mark Attendance:** 
   - Navigate to **Attendance**. Select the class and today's date. Mark the students and hit Save.
   - Try marking it again to see the duplicate protection kick in.
   - Edit the attendance by selecting the same date and making changes.
5. **View Reports:** Navigate to **Reports**, generate a report for the current month, and export the data to CSV!

## 🛡️ Security Measures
- Passwords are never stored in plain text.
- Authorization is always enforced on the backend (e.g., a teacher cannot mark attendance for a class they are not assigned to).
- The frontend Axios instance utilizes interceptors to securely attach JWT tokens to all outgoing requests.
- Protected Routes in React prevent unauthorized viewing of internal pages.

---
*Built as a technical assessment demonstration.*

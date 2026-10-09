# Aelyx - Premium Mini School ERP

## Project Overview
Aelyx is a comprehensive, visually stunning, and highly responsive Mini School Enterprise Resource Planning (ERP) system. Designed with a premium **Glassmorphism UI** and fluid animations, it seamlessly connects Admins, Teachers, and Students. The system provides powerful tools to manage classes, teacher assignments, student directories, and daily attendance tracking, complete with visual analytics and report generation.

## Tech Stack & Reasoning
- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Recharts, Axios, React Router.
  - *Reasoning*: React allows for a highly modular, component-driven architecture. TailwindCSS enabled the rapid creation of the complex, premium "frosted glass" aesthetic. Framer Motion was utilized to ensure every page transition and UI interaction feels smooth, dynamic, and high-end. Recharts provides robust and beautiful data visualization for attendance trends.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs.
  - *Reasoning*: Node.js and Express provide a lightweight, asynchronous, and high-performance API layer. MongoDB's NoSQL document structure is perfectly suited for managing flexible relationships between users, classes, and nested daily attendance records without complex joins.

## Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18 or higher)
- MongoDB (Running locally on port 27017, or a MongoDB Atlas URI)
- Git

## Setup Instructions & Environment Variables

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mini-school-erp
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory (optional, defaults to localhost:5000):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## Database Setup & Test Credentials
The database (MongoDB) will automatically be created when the server connects and performs its first write operation. 

**Test Credentials:**
If you have run the application, you can register an Admin via Postman, or use the following provided test credentials (if you have already seeded/created them in your local database):
- **Admin**: `admin@school.com` (Password: `password123`)
- **Teacher**: `teacher@school.com` (Password: `password123`)
- **Student**: `student@school.com` (Password: `password123`)

## How to Run Locally
You can get the entire project running locally in under 5 minutes.

1. **Start the Backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   *(Server should start on http://localhost:5000)*

2. **Start the Frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   *(App should be accessible at http://localhost:5173)*

## API Endpoint Overview
The RESTful API is secured via JWT Bearer Tokens.
- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Dashboard**: `GET /api/dashboard/summary` (Role-based response)
- **Classes**: `GET /api/classes`, `POST /api/classes`, `PUT /api/classes/:id`, `DELETE /api/classes/:id`
- **Students**: `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id`
- **Teachers**: `GET /api/teachers`, `POST /api/teachers`, `PUT /api/teachers/:id`, `DELETE /api/teachers/:id`
- **Attendance**: 
  - `GET /api/attendance/:classId/:date`
  - `POST /api/attendance`
  - `PUT /api/attendance/class/:classId`
  - `GET /api/attendance/report`

## What Was Completed
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for Admins, Teachers, and Students.
- **Premium UI Overhaul**: Implemented a stunning glassmorphism design system with animated mesh gradients and Framer Motion page transitions.
- **Core ERP Modules**: Full CRUD functionality for Classes, Teachers, and Students.
- **Attendance Engine**: Interactive daily attendance marking, historic editing, and CSV exports.
- **Visual Analytics**: Interactive `Recharts` SVG radial progress bars and area charts for attendance trends.
- **Security**: Password hashing, JWT-based auth, and UI auto-complete prevention for browser password managers on non-login forms.

## What Was Skipped
- **Dedicated Parent Portal**: A separate UI for parents was bypassed; instead, students and parents can use the "Student" role to view their read-only attendance stats.
- **Advanced Server-Side Pagination**: Implemented client-side filtering and search across tables rather than complex server-side cursor pagination to prioritize rapid feature delivery.

## What Would Be Improved With More Time
- **Pagination & Infinite Scroll**: For schools with 10,000+ students, server-side pagination would be implemented on the API and data tables.
- **Automated Notifications**: Integration with Nodemailer or Twilio to automatically email/SMS parents when a student is marked absent.
- **PDF Export**: Expand the current CSV export functionality to generate beautiful PDF report cards.
- **Dark Mode Toggle**: The UI is currently built on a dark/premium gradient theme; adding a stark light-mode toggle would improve accessibility.

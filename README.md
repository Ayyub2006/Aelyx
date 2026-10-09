# Aelyx – Premium Mini School ERP

Aelyx is a full-stack School ERP application designed to simplify school administration and attendance management. It provides role-based access for Admins, Teachers, and Students through a responsive interface featuring glassmorphism styling, smooth animations, attendance analytics, and reporting.

## 🌐 Live Demo

| Resource | Link |
|---|---|
| **Live Frontend** | [https://aelyx-seven.vercel.app](https://aelyx-seven.vercel.app) |
| **Backend API** | [https://aelyx-7.onrender.com](https://aelyx-7.onrender.com) |
| **API Health Check** | [Check API Status](https://aelyx-7.onrender.com/) |

## 🔑 Demo Credentials

Use the following accounts to explore the application's different roles.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@school.com` | `password123` |
| Teacher | `teach@school.com` | `teach123` |
| Student | `student@school.com` | `123456` |

**Note:** These are demo credentials for evaluation purposes. Access depends on the accounts existing in the deployed database. Please avoid using these credentials for real or sensitive information.

## ✨ Features

### Authentication and Authorization
- JWT-based authentication.
- Role-based access control for Admin, Teacher, and Student.
- Password hashing using bcryptjs.
- Protected routes and role-specific dashboards.

### Administration
- Create, view, update, and delete teachers.
- Manage student records and guardian contact details.
- Create and manage classes and sections.
- Assign teachers and students to classes.
- View dashboard statistics and attendance summaries.

### Attendance Management
- Mark daily student attendance.
- View and update attendance records.
- Review attendance history and reports.
- Track attendance percentages and summaries.
- Export supported attendance data to CSV.

### Premium User Interface
- Responsive React interface.
- Glassmorphism design and gradient backgrounds.
- Smooth animations using Framer Motion.
- Attendance charts using Recharts.
- Search and client-side filtering.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Password Security | bcryptjs |
| API Testing | Postman |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | MongoDB Atlas |

## 📁 Project Structure

```text
Aelyx/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── postman/
├── .gitignore
└── README.md
```

*The directory structure above is representative. Adjust it if your actual repository differs.*

## ⚙️ Local Installation and Setup

### Prerequisites

Install the following:

- Node.js 18 or higher
- npm
- MongoDB local installation or MongoDB Atlas
- Git
- Postman (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/Ayyub2006/Aelyx.git
cd Aelyx
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mini-school-erp
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Use the environment variable names expected by the actual backend code. For local development, the MongoDB URI above assumes a local MongoDB server.

Start the backend:

```bash
npm run dev
```

The backend should run at `http://localhost:5000`.

### 3. Configure the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the URL shown in your terminal, typically `http://localhost:5173`.

**Important:** The commands above assume that the relevant `dev` scripts exist in each `package.json`.

## ☁️ Deployment Configuration

### Frontend – Vercel

- Deploy the `frontend` directory.
- Set the environment variable:

```env
VITE_API_URL=https://aelyx-7.onrender.com/api
```

- Redeploy after changing environment variables.

### Backend – Render

Configure the backend service with the appropriate root directory, build command, and start command.

Set the following environment variables in Render:

```env
MONGODB_URI=<your_mongodb_atlas_connection_uri>
JWT_SECRET=<your_strong_random_secret>
JWT_EXPIRES_IN=30d
NODE_ENV=production
CLIENT_URL=https://aelyx-seven.vercel.app
```

Use the actual environment variable names required by the backend. Configure CORS to allow the deployed frontend domain.

### Database – MongoDB Atlas

- Store application data in MongoDB Atlas.
- Configure a database user and suitable network access.
- Use the Atlas connection URI as `MONGODB_URI`.
- Never commit database credentials or secrets to GitHub.

## 📡 API Endpoints

The backend exposes RESTful API endpoints. Protected routes require a JWT Bearer Token.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the authenticated user |
| POST | `/api/auth/register-admin` | Create an initial admin account, if enabled |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Retrieve dashboard statistics |

### Teachers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teachers` | Retrieve teachers |
| POST | `/api/teachers` | Create a teacher |
| PUT | `/api/teachers/:id` | Update a teacher |
| DELETE | `/api/teachers/:id` | Delete a teacher |

### Students

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | Retrieve students |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

### Classes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/classes` | Retrieve classes |
| POST | `/api/classes` | Create a class |
| PUT | `/api/classes/:id` | Update a class |
| DELETE | `/api/classes/:id` | Delete a class |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance/:classId/:date` | Retrieve attendance by class and date |
| POST | `/api/attendance` | Mark attendance |
| PUT | `/api/attendance/class/:classId` | Update class attendance, if supported |
| GET | `/api/attendance/report` | Retrieve attendance reports |

*Verify the endpoint methods and request formats against the current backend implementation.*

### Authorization Header

Include the token returned by login in protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 🧪 Testing

Test the following before submitting changes:

- Admin, Teacher, and Student login.
- Role-based permissions and protected routes.
- Teacher, student, and class CRUD operations.
- Attendance marking and editing.
- Attendance history, summaries, and CSV export.
- Dashboard data and API responses.
- Responsive layout on desktop and mobile.
- Error handling and database persistence.

Postman can be used to test the backend endpoints.

## 🔐 Security Notes

- Never commit `.env` files or real secrets.
- Use a strong JWT secret in production.
- Keep database credentials private.
- Restrict public admin-registration access after initial setup.
- Enforce authorization on the backend.
- Use dedicated demo accounts for evaluation.

## 🚀 Future Improvements

- Server-side pagination for large datasets.
- Automated email and SMS absence notifications.
- PDF attendance reports and report cards.
- Dedicated Parent Portal.
- Additional automated API and unit tests.
- Improved accessibility and light-mode support.

## 👨‍💻 Project Information

**Project:** Aelyx – Premium Mini School ERP  
**Category:** Full-Stack Web Application  
**Purpose:** School administration and attendance management  
**Frontend:** React + Vite  
**Backend:** Node.js + Express.js  
**Database:** MongoDB  

### Quick Links

- **Live Application:** https://aelyx-seven.vercel.app
- **Backend API:** https://aelyx-7.onrender.com
- **GitHub Repository:** https://github.com/Ayyub2006/Aelyx

---

Built with React, Node.js, Express, and MongoDB.

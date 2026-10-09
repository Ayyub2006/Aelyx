# Aelyx – Premium Mini School ERP

Aelyx is a full-stack Mini School Enterprise Resource Planning (ERP) system designed to simplify school administration and attendance management. It provides role-based access for administrators, teachers, and students through a responsive interface with glassmorphism styling, smooth animations, and attendance analytics.

The application supports teacher, student, and class management, daily attendance marking, attendance history, reporting, and visual summaries.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Test Credentials](#test-credentials)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Completed Features](#completed-features)
- [Limitations and Future Improvements](#limitations-and-future-improvements)

## Features

### Authentication and Authorization

- JWT-based authentication.
- Role-based access for Admin, Teacher, and Student users.
- Password hashing using bcryptjs.
- Protected application routes and role-specific dashboards.

### Administration

- Create, view, update, and delete teacher records.
- Manage student records and guardian contact information.
- Create and manage classes and sections.
- Assign teachers and students to classes.
- View dashboard statistics and attendance summaries.

### Attendance Management

- Mark daily attendance for students.
- View and update attendance records.
- Review attendance history and reports.
- View attendance statistics and percentage-based summaries.
- Export supported attendance data to CSV.

### User Interface and Analytics

- Responsive React interface.
- Glassmorphism-inspired design and gradient backgrounds.
- Page transitions and UI animations using Framer Motion.
- Attendance charts and visualizations using Recharts.
- Search and client-side filtering where implemented.

## Tech Stack

| Layer             | Technologies              |
| ----------------- | ------------------------- |
| Frontend          | React, Vite, Tailwind CSS |
| UI and Animation  | Framer Motion             |
| Charts            | Recharts                  |
| Routing           | React Router              |
| HTTP Client       | Axios                     |
| Backend           | Node.js, Express.js       |
| Database          | MongoDB, Mongoose         |
| Authentication    | JSON Web Tokens (JWT)     |
| Password Security | bcryptjs                  |
| API Testing       | Postman                   |

### Why This Stack?

- **React and Vite:** Support a modular frontend and fast development workflow.
- **Tailwind CSS and Framer Motion:** Help build a polished, responsive interface with smooth interactions.
- **Node.js and Express:** Provide a straightforward REST API architecture.
- **MongoDB and Mongoose:** Support document-based data storage and schema validation.
- **JWT and bcryptjs:** Support authenticated access and secure password hashing.

## Prerequisites

Install the following before running the project:

- **Node.js:** Version 18 or higher.
- **npm:** Included with Node.js.
- **MongoDB:** A local MongoDB server or a MongoDB Atlas connection URI.
- **Git:** Required to clone the repository.
- **Postman:** Recommended for testing API endpoints.

Verify your installations:

```bash
node --version
npm --version
git --version
```

Ensure that MongoDB is running before starting the backend.

## Project Structure

The project is organized into frontend and backend applications.

```text
Aelyx/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/             # If your backend uses this structure
├── postman/
│   └── Mini-School-ERP.postman_collection.json
├── .gitignore
└── README.md
```

**Note:** The exact source directories may differ depending on your implementation. Keep the actual project structure when updating this section. Include the Postman collection if you have exported it.

## Getting Started

### 1. Clone the Repository

Replace the placeholder below with your actual GitHub repository URL.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

### 2. Install Backend Dependencies

Open a terminal in the project root:

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend/` directory.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mini-school-erp
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

Use the variable names expected by your actual backend code. If your application uses a different MongoDB variable name, update the configuration accordingly.

### 4. Install Frontend Dependencies

Open a **second terminal** in the project root:

```bash
cd frontend
npm install
```

### 5. Configure Frontend Environment Variables

If your frontend supports a configurable API URL, create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

If the application already defaults to this API URL, the frontend environment file may be optional.

Restart the Vite development server after changing frontend environment variables.

## Environment Variables

### Backend

| Variable     | Purpose                   | Example                                     |
| ------------ | ------------------------- | ------------------------------------------- |
| `PORT`       | Backend server port       | `5000`                                      |
| `MONGO_URI`  | MongoDB connection string | `mongodb://127.0.0.1:27017/mini-school-erp` |
| `JWT_SECRET` | Secret used to sign JWTs  | A long, random secret                       |
| `NODE_ENV`   | Application environment   | `development`                               |

### Frontend

| Variable       | Purpose                           | Example                     |
| -------------- | --------------------------------- | --------------------------- |
| `VITE_API_URL` | Base URL for backend API requests | `http://localhost:5000/api` |

**Important:** These names and defaults must match the application's actual configuration. Vite exposes variables prefixed with `VITE_` to browser code, so never put database credentials, JWT secrets, or other private values in frontend environment variables.

## Database Setup

Aelyx uses MongoDB for persistent data storage.

### Option A: Local MongoDB

1. Install MongoDB Community Server.
2. Start the MongoDB service using the appropriate method for your operating system.
3. Confirm that MongoDB is accepting connections on port `27017`.
4. Configure `MONGO_URI` in `backend/.env`.
5. Start the backend.

Example connection URI:

```text
mongodb://127.0.0.1:27017/mini-school-erp
```

MongoDB can create the database and collections when the application writes data, depending on how the application initializes its models and records.

### Option B: MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Configure database access credentials.
3. Add your development machine's IP address to the network access allowlist.
4. Copy the connection URI.
5. Place the URI in `MONGO_URI` in `backend/.env`.

Do not commit your Atlas URI or database password to GitHub.

### Initial Data and User Accounts

The database must contain valid user accounts and any required school records before all application features can be tested.

If the project includes a seed script, run the command documented in `backend/package.json` or in the seed script's instructions.

If no seed script exists, create the required accounts through the application's supported registration flow or the appropriate API endpoint. Follow the backend's validation and role-assignment rules.

Do not assume demo accounts exist in a newly created database.

## Running the Application

Run the backend and frontend in separate terminal windows.

### Terminal 1: Start the Backend

```bash
cd backend
npm run dev
```

The backend should start at:

```text
http://localhost:5000
```

This command assumes that `backend/package.json` defines a `dev` script. Check the available scripts if the command is not recognized.

### Terminal 2: Start the Frontend

```bash
cd frontend
npm run dev
```

Vite will display the local development URL, typically:

```text
http://localhost:5173
```

Open the URL displayed in your terminal.

### Check Available npm Scripts

If either command fails, inspect the corresponding `package.json` file:

```bash
npm run
```

Run this command from `backend/` or `frontend/`, depending on which application's scripts you want to inspect.

## Test Credentials

The following credentials are intended as examples of local demo accounts:

| Role    | Email                | Password      |
| ------- | -------------------- | ------------- |
| Admin   | `admin@school.com`   | `password123` |
| Teacher | `teacher@school.com` | `password123` |
| Student | `student@school.com` | `password123` |

**These accounts are available only if they have already been created in the database or generated by a seed script.** A fresh MongoDB database will not automatically contain these users unless the project explicitly seeds them.

For submission, verify each account before listing it as a working test credential. Use dedicated demo accounts, not real users' credentials.

## API Documentation

The backend exposes RESTful endpoints and uses JWT Bearer Tokens for protected requests.

The following endpoints describe the currently documented API surface. Confirm the actual routes, request payloads, and authorization rules against the backend implementation before submission.

### Authentication

| Method | Endpoint             | Purpose                                       |
| ------ | -------------------- | --------------------------------------------- |
| `POST` | `/api/auth/login`    | Authenticate a user                           |
| `POST` | `/api/auth/register` | Register a user, if registration is enabled   |
| `GET`  | `/api/auth/me`       | Retrieve the authenticated user's information |

### Dashboard

| Method | Endpoint                 | Purpose                                        |
| ------ | ------------------------ | ---------------------------------------------- |
| `GET`  | `/api/dashboard/summary` | Retrieve role-appropriate dashboard statistics |

### Classes

| Method   | Endpoint           | Purpose          |
| -------- | ------------------ | ---------------- |
| `GET`    | `/api/classes`     | Retrieve classes |
| `POST`   | `/api/classes`     | Create a class   |
| `PUT`    | `/api/classes/:id` | Update a class   |
| `DELETE` | `/api/classes/:id` | Delete a class   |

### Students

| Method   | Endpoint            | Purpose           |
| -------- | ------------------- | ----------------- |
| `GET`    | `/api/students`     | Retrieve students |
| `POST`   | `/api/students`     | Create a student  |
| `PUT`    | `/api/students/:id` | Update a student  |
| `DELETE` | `/api/students/:id` | Delete a student  |

### Teachers

| Method   | Endpoint            | Purpose           |
| -------- | ------------------- | ----------------- |
| `GET`    | `/api/teachers`     | Retrieve teachers |
| `POST`   | `/api/teachers`     | Create a teacher  |
| `PUT`    | `/api/teachers/:id` | Update a teacher  |
| `DELETE` | `/api/teachers/:id` | Delete a teacher  |

### Attendance

| Method | Endpoint                         | Purpose                                                     |
| ------ | -------------------------------- | ----------------------------------------------------------- |
| `GET`  | `/api/attendance/:classId/:date` | Retrieve attendance for a class and date                    |
| `POST` | `/api/attendance`                | Create or mark attendance                                   |
| `PUT`  | `/api/attendance/class/:classId` | Update class attendance, if supported by the implementation |
| `GET`  | `/api/attendance/report`         | Retrieve attendance reports                                 |

### Authentication Header

For protected endpoints, include the token returned by the login endpoint:

```http
Authorization: Bearer <JWT_TOKEN>
```

Use the actual API response format and request body expected by the backend.

### Postman Collection

If a Postman collection is included in the repository, import it into Postman and configure its base URL and authentication token.

Recommended local base URL:

```text
http://localhost:5000/api
```

The collection should include the login flow and representative requests for classes, teachers, students, and attendance. Export and commit the collection so that the reviewer can reproduce the API tests.

## Testing

Before submission, verify the following manually or using your available automated tests.

### Authentication and Permissions

- [ ] Valid login works.
- [ ] Invalid credentials are rejected.
- [ ] Protected endpoints reject unauthenticated requests.
- [ ] Admin and Teacher permissions are enforced by the backend.
- [ ] Teachers cannot access or modify classes outside their assigned permissions.
- [ ] Student accounts have only their intended permissions.

### School Management

- [ ] Teacher creation, editing, listing, and deletion work.
- [ ] Student creation, editing, listing, and deletion work.
- [ ] Class creation, editing, listing, and deletion work.
- [ ] Class assignments and related records remain consistent.

### Attendance

- [ ] Attendance can be marked and saved.
- [ ] Existing attendance can be retrieved and updated.
- [ ] Attendance history and reports return correct records.
- [ ] Attendance totals and percentages are calculated correctly.
- [ ] Duplicate attendance records are prevented where required.
- [ ] CSV export works, if implemented.

### Application Quality

- [ ] Loading, empty, error, and success states are handled.
- [ ] The interface works at desktop and mobile widths.
- [ ] Backend and frontend start successfully from a fresh setup.
- [ ] No secrets or private credentials are committed to the repository.

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running.
- Check that `MONGO_URI` is correct.
- Verify that the database server is listening on the expected port.
- If using Atlas, verify network access and database credentials.

### `npm run dev` Is Not Recognized

- Run `npm install` in the appropriate application directory.
- Inspect the `scripts` section in that directory's `package.json`.
- Use the development command defined by the project.

### Frontend Cannot Reach the Backend

- Ensure the backend is running.
- Verify `VITE_API_URL`.
- Check the browser console and backend logs.
- Confirm that the backend's CORS configuration allows the frontend origin.

### Login Fails

- Verify that the user exists in MongoDB.
- Confirm the correct password and role.
- Check the login request and response in Postman.
- If using seeded accounts, run the project's documented seed process.

### Port Already in Use

Stop the process occupying the required port or configure a different port in the appropriate environment file. Update the frontend API URL if the backend port changes.

## Security Notes

- Keep `.env` files out of version control.
- Provide `.env.example` files with placeholders instead of actual secrets.
- Use a strong, unique JWT secret outside development.
- Never expose database credentials or JWT secrets in frontend code.
- Use password hashing rather than storing plaintext passwords.
- Enforce role-based authorization on the backend, not only by hiding frontend controls.
- Avoid using real personal data in demo accounts.
- Use HTTPS and secure production configuration when deploying the application.

## Completed Features

The current implementation includes the following features, subject to verification against the final codebase:

- Role-based access for Admin, Teacher, and Student users.
- Teacher, student, and class management.
- Daily attendance marking and historical attendance editing.
- Attendance summaries and visual analytics using Recharts.
- CSV export functionality.
- Responsive UI with glassmorphism styling and Framer Motion animations.
- JWT-based authentication and password hashing.
- Client-side search and filtering where implemented.

## Limitations and Future Improvements

### Current Limitations

- A dedicated Parent Portal has not been implemented.
- Advanced server-side pagination has not been implemented; client-side search and filtering are used instead.

### Future Improvements

- Server-side pagination for large datasets.
- Automated absence notifications using email or SMS services.
- PDF exports for attendance reports and report cards.
- A light-mode theme option and additional accessibility improvements.
- Expanded automated API and unit test coverage.

## Submission Checklist

Before submitting the project:

- [ ] Push the final source code to GitHub.
- [ ] Ensure `README.md` contains correct setup instructions.
- [ ] Include `.env.example` files for required environment variables.
- [ ] Confirm that no real `.env` files or secrets are committed.
- [ ] Verify the test credentials or document how to create demo accounts.
- [ ] Include the exported Postman collection, if available.
- [ ] Test the project from a fresh clone.
- [ ] Add a live demo URL if the application has been deployed.

**Deployment:** A live deployment is optional for this project unless otherwise required by the submission instructions.

---

Built as a full-stack school administration and attendance management project using React, Node.js, Express, and MongoDB.

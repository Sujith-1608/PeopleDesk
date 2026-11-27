# PeopleDesk – Employee & Payroll Management System

A full-stack HR management application designed to simplify employee administration, attendance tracking, leave management, and payroll operations.

Built using **React, Node.js, Express, and PostgreSQL**, PeopleDesk provides a centralized platform for managing essential HR operations through a clean and responsive interface.

## 🌐 Live Demo

| Resource | URL |
|---|---|
| **Live Application** | https://people-desk-blue.vercel.app |
| **Frontend Hosting** | https://vercel.com |
| **Backend API** | https://peopledesk-api-6n4p.onrender.com |
| **API Health Check** | https://peopledesk-api-6n4p.onrender.com/api/health |

## 📌 About

PeopleDesk is a full-stack Employee & Payroll Management System developed to manage day-to-day HR activities efficiently.

The application provides administrative functionality for maintaining employee records, organizing departments, tracking attendance, processing leave requests, and generating monthly payroll records.

It follows a client-server architecture, with a React frontend communicating with a RESTful API built using Node.js and Express. PostgreSQL is used for persistent data storage, while JWT-based authentication protects application endpoints.

The application is deployed using Vercel, Render, and Neon PostgreSQL.

## ✨ Features

### 1. Authentication & Authorization
- Secure administrator login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Protected API routes.

### 2. Dashboard
- Total employee count.
- Active employee statistics.
- Department overview.
- Pending leave request count.
- Current-month payroll summary.
- Recently added employees.

### 3. Employee Management
- Add new employees.
- View employee information.
- Update employee details.
- Delete employee records.
- Assign departments and job roles.
- Manage employment status.

### 4. Department Management
- Create departments.
- View department details.
- Update department information.
- Delete departments when no employees are assigned.
- View employee counts by department.

### 5. Attendance Management
- Record daily attendance.
- Track check-in and check-out times.
- Maintain attendance statuses.
- View attendance records by date.

### 6. Leave Management
- Submit employee leave requests.
- Support Casual, Sick, Annual, and Unpaid leave types.
- Approve or reject leave requests.
- Track leave request statuses.

### 7. Payroll Management
- Generate monthly payroll records.
- Calculate net salary using basic salary, allowances, and deductions.
- Track payment status.
- Mark payroll records as Paid, Pending, or Failed.
- Maintain payroll history.

### 8. Salary History
- Automatically record employee salary changes.
- Maintain previous and updated salary details.
- Track salary change dates and reasons.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Driver | node-postgres (`pg`) |
| Authentication | JWT, bcryptjs |
| API Communication | REST API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Neon PostgreSQL |
| Version Control | Git, GitHub |

## 🗄️ Database Support

PeopleDesk includes support for both **MySQL 8 and PostgreSQL**.

The project was initially developed using MySQL 8 and later migrated to PostgreSQL for cloud deployment.

| Database | Usage | Schema Files |
|---|---|---|
| MySQL 8 | Original local development implementation | `database/schema.sql`, `database/seed.sql` |
| PostgreSQL | Current production database hosted on Neon | `database/schema-postgres.sql`, `database/seed-postgres.sql` |

### Database Configuration

- **MySQL:** Uses `mysql2` with the original `db.js` connection module.
- **PostgreSQL:** Uses the `pg` driver with `db-postgres.js`.
- **Production:** The deployed application currently uses PostgreSQL through Neon.

The MySQL implementation is retained for reference, while PostgreSQL is the active database configuration for the deployed application.

## 🏗️ Application Architecture

```text
              USER
                |
                v
       React + Vite Frontend
             (Vercel)
                |
                | HTTP / REST API
                v
       Node.js + Express
             (Render)
                |
                | PostgreSQL Connection
                v
          Neon PostgreSQL
             (Database)
```

## 📂 Project Structure

```text
employee-payroll-management/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── schema-postgres.sql
│   └── seed-postgres.sql
│
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── employees.js
│   │   │   ├── departments.js
│   │   │   ├── attendance.js
│   │   │   ├── leaves.js
│   │   │   ├── payroll.js
│   │   │   └── reference.js
│   │   │
│   │   ├── createAdmin.js
│   │   ├── db-postgres.js
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── .env.example
│   ├── index.html
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Local Development Setup

### Prerequisites

Install the following:

- Node.js 20 or later
- npm
- Git
- PostgreSQL database (Neon can be used)

### 1. Clone the repository

```bash
git clone https://github.com/Sujith-1608/PeopleDesk.git

cd PeopleDesk
```

### 2. Configure the PostgreSQL database

Create a PostgreSQL database using Neon or another PostgreSQL provider.

Execute the following SQL files against your database:

```text
database/schema-postgres.sql
database/seed-postgres.sql
```

The schema script creates the required tables, constraints, indexes, and salary history trigger.

The seed script inserts fictional sample records for testing.

### 3. Configure the backend

Navigate to the backend directory:

```bash
cd backend
```

Create a `.env` file using `.env.example` as a reference.

Configure the following environment variables:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_long_random_secret

CLIENT_ORIGIN=http://localhost:5173
```

Install backend dependencies:

```bash
npm install
```

Create the first administrator:

```bash
npm run create-admin
```

Enter the administrator's name, email, and a password of at least 12 characters when prompted.

Start the backend development server:

```bash
npm run dev
```

Backend API:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 4. Configure the frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Create a `.env` file using `.env.example` as a reference.

Configure:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Sign in using the administrator credentials created earlier.

## 🔗 API Endpoints

All endpoints except the login endpoint require a valid JWT token in the Authorization header.

```http
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate administrator |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Retrieve dashboard statistics |

### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | Retrieve employees |
| GET | `/api/employees/:id` | Retrieve employee by ID |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Departments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/departments` | Retrieve departments |
| POST | `/api/departments` | Create department |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance` | Retrieve attendance records |
| POST | `/api/attendance` | Create attendance record |

### Leave Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leaves` | Retrieve leave requests |
| POST | `/api/leaves` | Submit leave request |
| PATCH | `/api/leaves/:id/status` | Approve or reject leave |

### Payroll

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payroll` | Retrieve payroll records |
| POST | `/api/payroll` | Generate payroll |
| PATCH | `/api/payroll/:id/status` | Update payment status |

### Reference Data

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reference/jobs` | Retrieve available job roles |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend and database connectivity |

## 🚀 Production Deployment

The application is deployed using the following services:

### Frontend – Vercel
- Connected to the GitHub repository.
- Root directory: `frontend`.
- Framework: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Environment variable: `VITE_API_URL`.

### Backend – Render
- Connected to the GitHub repository.
- Root directory: `backend`.
- Build command: `npm install`.
- Start command: `npm start`.
- Environment variables:
  - `NODE_ENV`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CLIENT_ORIGIN`

### Database – Neon
- PostgreSQL database hosted on Neon.
- Backend connects using the PostgreSQL connection string.
- Database schema and sample data are initialized through the PostgreSQL SQL scripts.

## 🔐 Security Considerations

- Passwords are hashed using bcryptjs.
- JWT authentication protects application endpoints.
- SQL queries use parameterized inputs.
- Environment variables store database credentials and authentication secrets.
- `.env` files must never be committed to GitHub.
- Sample employee information is fictional.

## ⚠️ Limitations & Future Improvements

This project is intended as a portfolio and demonstration application.

Potential future improvements include:

- Role-based access control with separate HR and administrator permissions.
- Employee self-service portal.
- Advanced attendance reports.
- Payroll tax and statutory deduction calculations.
- Automated payroll processing.
- Audit logging.
- API rate limiting.
- Automated testing and CI/CD workflows.
- Enhanced reporting and analytics.

Payroll calculations currently use basic salary, allowances, and deductions entered by the administrator. They do not implement country-specific tax, provident fund, or statutory payroll rules.

## 👨‍💻 Author

**Sujith Reddy Sama**

- GitHub: https://github.com/Sujith-1608

---

⭐ If you find this project useful, consider giving the repository a star!
# Employee & Payroll Management System

A full-stack HR and payroll management application built with React, Express, Node.js and MySQL 8.

## Features
- JWT authentication with bcrypt password hashing
- Dashboard with employee, department, attendance and payroll summaries
- Employee CRUD
- Department CRUD
- Attendance records
- Leave request submission, approval and rejection
- Monthly payroll generation and payment status updates
- Salary history automatically recorded by a MySQL trigger
- REST API with validation and parameterized SQL queries

## Stack
- Frontend: React, Vite, React Router, plain CSS
- Backend: Node.js, Express, mysql2, JWT, bcryptjs
- Database: MySQL 8

## Requirements
- Node.js 20+
- MySQL 8+
- npm

## 1. Create the database
Open MySQL Workbench or the MySQL CLI and execute:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

This creates `employee_payroll_db`, its tables, indexes, trigger, and demo data.

## 2. Configure the backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set your MySQL credentials and a long random JWT secret.

Install dependencies, create the first admin, and start:
```bash
npm install
npm run create-admin
npm run dev
```
The API runs at `http://localhost:5000`.

Create your first administrator securely with:
```bash
npm run create-admin
```
Enter the name, email and a password of at least 12 characters when prompted. This creates a bcrypt password hash in the Users table. Do not use a shared demo password in production.

## 3. Configure the frontend
In another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## 4. Useful API endpoints
All endpoints except `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Sign in |
| GET | `/api/dashboard` | Dashboard statistics |
| GET/POST | `/api/employees` | List/create employees |
| GET/PUT/DELETE | `/api/employees/:id` | Read/update/delete employee |
| GET/POST | `/api/departments` | List/create departments |
| GET | `/api/attendance` | List attendance |
| POST | `/api/attendance` | Create attendance |
| GET/POST | `/api/leaves` | List/create leave requests |
| PATCH | `/api/leaves/:id/status` | Approve/reject leave |
| GET/POST | `/api/payroll` | List/generate payroll |
| PATCH | `/api/payroll/:id/status` | Mark payroll paid/failed |

## 5. Production deployment overview
1. Push this repository to GitHub.
2. Create a managed MySQL 8 database with a provider that allows remote connections.
3. Run `database/schema.sql` and `database/seed.sql` against the production database. Then run `npm run create-admin` from the backend directory against the production database to create the first administrator with a strong unique password.
4. Deploy `backend` as a Node web service. Configure all variables from `backend/.env.example` in the host dashboard. Set `CLIENT_ORIGIN` to your deployed frontend URL.
5. Deploy `frontend` as a static site. Set `VITE_API_URL` to your deployed backend URL plus `/api`.
6. Add the frontend domain to the backend CORS allow-list.
7. Test login, CRUD, leave approval and payroll generation on the live site.

Never commit `.env` files or real employee/payroll information. The included data is fictional demo data.

## Project structure
```text
employee-payroll-management/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── db.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
└── README.md
```

## Notes
- This is a portfolio/demo application, not payroll or legal compliance software.
- It intentionally keeps the first version focused. Add role-based permissions, audit logging, CSRF protections if using cookies, rate limiting, backups, secure secret management, and thorough tests before handling real business data.
- Payroll generation uses the employee's current base salary and user-entered allowances/deductions. It does not calculate country-specific tax, provident fund, or statutory deductions.

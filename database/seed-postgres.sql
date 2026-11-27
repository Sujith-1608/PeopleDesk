
-- PeopleDesk PostgreSQL Seed Data
-- Database: Neon PostgreSQL

-- 1. Departments
INSERT INTO departments
(department_id, department_name, location)
VALUES
(1, 'Engineering', 'Hyderabad'),
(2, 'Human Resources', 'Bengaluru'),
(3, 'Finance', 'Mumbai'),
(4, 'Marketing', 'Delhi'),
(5, 'Operations', 'Chennai')
ON CONFLICT (department_id) DO NOTHING;

-- 2. Jobs
INSERT INTO jobs
(job_id, job_title, job_description)
VALUES
(1, 'Software Engineer', 'Builds and maintains software'),
(2, 'Senior Software Engineer', 'Leads technical delivery'),
(3, 'HR Executive', 'Supports people operations'),
(4, 'Accountant', 'Maintains financial records'),
(5, 'Marketing Executive', 'Runs marketing campaigns'),
(6, 'Project Manager', 'Coordinates projects and teams')
ON CONFLICT (job_id) DO NOTHING;

-- 3. Employees
INSERT INTO employees
(emp_id, first_name, last_name, email, phone, hire_date,
 department_id, job_id, base_salary, employment_status)
VALUES
(1, 'Rahul', 'Sharma', 'rahul@example.com', '9000000001', '2022-01-10', 1, 1, 45000, 'Active'),
(2, 'Priya', 'Reddy', 'priya@example.com', '9000000002', '2021-03-15', 1, 2, 65000, 'Active'),
(3, 'Arjun', 'Kumar', 'arjun@example.com', '9000000003', '2023-06-01', 2, 3, 35000, 'Active'),
(4, 'Sneha', 'Patel', 'sneha@example.com', '9000000004', '2020-08-20', 3, 4, 55000, 'Active'),
(5, 'Kiran', 'Rao', 'kiran@example.com', '9000000005', '2022-11-05', 4, 5, 40000, 'Active'),
(6, 'Ananya', 'Das', 'ananya@example.com', '9000000006', '2019-02-12', 1, 6, 80000, 'Active'),
(7, 'Vikram', 'Singh', 'vikram@example.com', '9000000007', '2023-01-18', 5, 6, 60000, 'Active'),
(8, 'Meera', 'Nair', 'meera@example.com', '9000000008', '2021-09-25', 2, 3, 38000, 'On Leave')
ON CONFLICT (emp_id) DO NOTHING;

-- 4. Attendance
INSERT INTO attendance
(attendance_id, emp_id, attendance_date, check_in, check_out, attendance_status)
VALUES
(1, 1, CURRENT_DATE, '09:00:00', '18:00:00', 'Present'),
(2, 2, CURRENT_DATE, '09:10:00', '18:00:00', 'Present'),
(3, 3, CURRENT_DATE, NULL, NULL, 'Absent'),
(4, 4, CURRENT_DATE, '09:00:00', '18:00:00', 'Present')
ON CONFLICT (emp_id, attendance_date) DO NOTHING;

-- 5. Leave Requests
INSERT INTO leave_requests
(emp_id, leave_type, start_date, end_date, reason, leave_status)
SELECT
    1,
    'Casual',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '6 days',
    'Personal work',
    'Pending'
WHERE NOT EXISTS (
    SELECT 1
    FROM leave_requests
    WHERE emp_id = 1 AND reason = 'Personal work'
);

-- 6. Payroll
INSERT INTO payroll
(payroll_id, emp_id, payroll_month, basic_salary,
 allowances, deductions, payment_date, payment_status)
VALUES
(1, 1, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date,
 45000, 5000, 2000, CURRENT_DATE - INTERVAL '1 month', 'Paid'),

(2, 2, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date,
 65000, 8000, 3000, CURRENT_DATE - INTERVAL '1 month', 'Paid'),

(3, 3, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date,
 35000, 3000, 1000, CURRENT_DATE - INTERVAL '1 month', 'Paid')
ON CONFLICT (payroll_id) DO NOTHING;

-- 7. Reset identity sequences
-- Required because we inserted explicit IDs.

SELECT setval(pg_get_serial_sequence('departments', 'department_id'),
    COALESCE((SELECT MAX(department_id) FROM departments), 1),
    EXISTS (SELECT 1 FROM departments));

SELECT setval(pg_get_serial_sequence('jobs', 'job_id'),
    COALESCE((SELECT MAX(job_id) FROM jobs), 1),
    EXISTS (SELECT 1 FROM jobs));

SELECT setval(pg_get_serial_sequence('employees', 'emp_id'),
    COALESCE((SELECT MAX(emp_id) FROM employees), 1),
    EXISTS (SELECT 1 FROM employees));

SELECT setval(pg_get_serial_sequence('attendance', 'attendance_id'),
    COALESCE((SELECT MAX(attendance_id) FROM attendance), 1),
    EXISTS (SELECT 1 FROM attendance));

SELECT setval(pg_get_serial_sequence('leave_requests', 'leave_id'),
    COALESCE((SELECT MAX(leave_id) FROM leave_requests), 1),
    EXISTS (SELECT 1 FROM leave_requests));

SELECT setval(pg_get_serial_sequence('payroll', 'payroll_id'),
    COALESCE((SELECT MAX(payroll_id) FROM payroll), 1),
    EXISTS (SELECT 1 FROM payroll));

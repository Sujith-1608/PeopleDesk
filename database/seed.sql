USE employee_payroll_db;

INSERT IGNORE INTO Departments (department_name, location) VALUES
('Engineering','Hyderabad'),('Human Resources','Bengaluru'),
('Finance','Mumbai'),('Marketing','Delhi'),('Operations','Chennai');

INSERT IGNORE INTO Jobs (job_title, job_description) VALUES
('Software Engineer','Builds and maintains software'),
('Senior Software Engineer','Leads technical delivery'),
('HR Executive','Supports people operations'),
('Accountant','Maintains financial records'),
('Marketing Executive','Runs marketing campaigns'),
('Project Manager','Coordinates projects and teams');

INSERT IGNORE INTO Employees
(first_name,last_name,email,phone,hire_date,department_id,job_id,base_salary,employment_status)
VALUES
('Rahul','Sharma','rahul@example.com','9000000001','2022-01-10',1,1,45000,'Active'),
('Priya','Reddy','priya@example.com','9000000002','2021-03-15',1,2,65000,'Active'),
('Arjun','Kumar','arjun@example.com','9000000003','2023-06-01',2,3,35000,'Active'),
('Sneha','Patel','sneha@example.com','9000000004','2020-08-20',3,4,55000,'Active'),
('Kiran','Rao','kiran@example.com','9000000005','2022-11-05',4,5,40000,'Active'),
('Ananya','Das','ananya@example.com','9000000006','2019-02-12',1,6,80000,'Active'),
('Vikram','Singh','vikram@example.com','9000000007','2023-01-18',5,6,60000,'Active'),
('Meera','Nair','meera@example.com','9000000008','2021-09-25',2,3,38000,'On Leave');

INSERT IGNORE INTO Attendance
(emp_id,attendance_date,check_in,check_out,attendance_status)
VALUES
(1,CURRENT_DATE,'09:00:00','18:00:00','Present'),
(2,CURRENT_DATE,'09:10:00','18:00:00','Present'),
(3,CURRENT_DATE,NULL,NULL,'Absent'),
(4,CURRENT_DATE,'09:00:00','18:00:00','Present');

INSERT INTO Leave_Requests
(emp_id,leave_type,start_date,end_date,reason,leave_status)
SELECT 1,'Casual',CURRENT_DATE + INTERVAL 5 DAY,CURRENT_DATE + INTERVAL 6 DAY,
       'Personal work','Pending'
WHERE NOT EXISTS (SELECT 1 FROM Leave_Requests WHERE emp_id=1 AND reason='Personal work');

INSERT IGNORE INTO Payroll
(emp_id,payroll_month,basic_salary,allowances,deductions,payment_date,payment_status)
VALUES
(1,DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH,'%Y-%m-01'),45000,5000,2000,CURRENT_DATE - INTERVAL 1 MONTH,'Paid'),
(2,DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH,'%Y-%m-01'),65000,8000,3000,CURRENT_DATE - INTERVAL 1 MONTH,'Paid'),
(3,DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH,'%Y-%m-01'),35000,3000,1000,CURRENT_DATE - INTERVAL 1 MONTH,'Paid');


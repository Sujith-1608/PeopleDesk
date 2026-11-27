CREATE DATABASE IF NOT EXISTS employee_payroll_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE employee_payroll_db;

CREATE TABLE IF NOT EXISTS Departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  job_title VARCHAR(100) NOT NULL UNIQUE,
  job_description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','hr') NOT NULL DEFAULT 'hr',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Employees (
  emp_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  hire_date DATE NOT NULL,
  department_id INT NOT NULL,
  job_id INT NOT NULL,
  base_salary DECIMAL(12,2) NOT NULL,
  employment_status ENUM('Active','Inactive','On Leave') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_employee_salary CHECK (base_salary >= 0),
  CONSTRAINT fk_employee_department FOREIGN KEY (department_id)
    REFERENCES Departments(department_id),
  CONSTRAINT fk_employee_job FOREIGN KEY (job_id)
    REFERENCES Jobs(job_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  attendance_status ENUM('Present','Absent','Half Day','Work From Home') NOT NULL,
  UNIQUE KEY uq_attendance_employee_date (emp_id, attendance_date),
  CONSTRAINT chk_attendance_time CHECK (
    check_in IS NULL OR check_out IS NULL OR check_out >= check_in
  ),
  CONSTRAINT fk_attendance_employee FOREIGN KEY (emp_id)
    REFERENCES Employees(emp_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Leave_Requests (
  leave_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  leave_type ENUM('Casual','Sick','Annual','Unpaid') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(500),
  leave_status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  applied_on DATE NOT NULL DEFAULT (CURRENT_DATE),
  reviewed_at DATETIME NULL,
  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
  CONSTRAINT fk_leave_employee FOREIGN KEY (emp_id)
    REFERENCES Employees(emp_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Payroll (
  payroll_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  payroll_month DATE NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL,
  allowances DECIMAL(12,2) NOT NULL DEFAULT 0,
  deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(12,2) GENERATED ALWAYS AS
    (basic_salary + allowances - deductions) STORED,
  payment_date DATE NULL,
  payment_status ENUM('Pending','Paid','Failed') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payroll_employee_month (emp_id, payroll_month),
  CONSTRAINT chk_payroll_amounts CHECK (
    basic_salary >= 0 AND allowances >= 0 AND deductions >= 0
    AND basic_salary + allowances >= deductions
  ),
  CONSTRAINT chk_payroll_month CHECK (DAY(payroll_month) = 1),
  CONSTRAINT fk_payroll_employee FOREIGN KEY (emp_id)
    REFERENCES Employees(emp_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Salary_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  old_salary DECIMAL(12,2) NOT NULL,
  new_salary DECIMAL(12,2) NOT NULL,
  effective_date DATE NOT NULL,
  change_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_salary_history_employee FOREIGN KEY (emp_id)
    REFERENCES Employees(emp_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_employee_department ON Employees(department_id);
CREATE INDEX idx_employee_job ON Employees(job_id);
CREATE INDEX idx_attendance_date ON Attendance(attendance_date);
CREATE INDEX idx_leave_status ON Leave_Requests(leave_status);
CREATE INDEX idx_payroll_month ON Payroll(payroll_month);
CREATE INDEX idx_salary_history_employee ON Salary_History(emp_id);

DROP TRIGGER IF EXISTS trg_employee_salary_history;
DELIMITER //
CREATE TRIGGER trg_employee_salary_history
AFTER UPDATE ON Employees
FOR EACH ROW
BEGIN
  IF OLD.base_salary <> NEW.base_salary THEN
    INSERT INTO Salary_History
      (emp_id, old_salary, new_salary, effective_date, change_reason)
    VALUES
      (NEW.emp_id, OLD.base_salary, NEW.base_salary, CURRENT_DATE, 'Salary updated');
  END IF;
END//
DELIMITER ;

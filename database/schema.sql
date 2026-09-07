-- Complete Enterprise Employee Management System Database Schema
DROP DATABASE IF EXISTS `employee_db`;
CREATE DATABASE `employee_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `employee_db`;

-- 1. Users table (Authentication & Roles)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('admin', 'hr', 'manager', 'employee') DEFAULT 'employee',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default user accounts (Passwords: admin123, hr123, manager123, emp123)
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `role`) VALUES
(1, 'admin', '$2y$10$4n9xW1x9dY1x9dY1x9dY1eZ6dK2YpM8nN0qP2rS4tV6wX8yZ0aB2c', 'System Administrator', 'admin@company.com', 'admin'),
(2, 'hr', '$2y$10$4n9xW1x9dY1x9dY1x9dY1eZ6dK2YpM8nN0qP2rS4tV6wX8yZ0aB2c', 'Priya Singh (HR)', 'hr@company.com', 'hr'),
(3, 'manager', '$2y$10$4n9xW1x9dY1x9dY1x9dY1eZ6dK2YpM8nN0qP2rS4tV6wX8yZ0aB2c', 'Vikram Lead (Manager)', 'manager@company.com', 'manager'),
(4, 'employee', '$2y$10$4n9xW1x9dY1x9dY1x9dY1eZ6dK2YpM8nN0qP2rS4tV6wX8yZ0aB2c', 'Rahul Developer (Employee)', 'rahul@company.com', 'employee');

-- 2. Departments table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `departments` (`id`, `name`, `code`, `description`) VALUES
(1, 'Engineering', 'ENG', 'Software development and IT operations'),
(2, 'Human Resources', 'HR', 'Recruitment, payroll, and staff relations'),
(3, 'Marketing & Sales', 'MKT', 'Brand strategy, sales campaigns, and growth'),
(4, 'Finance', 'FIN', 'Corporate accounting, budgeting, and audits');

-- 3. Employees table
CREATE TABLE IF NOT EXISTS `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `employee_code` VARCHAR(20) NOT NULL UNIQUE,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `department_id` INT NOT NULL,
  `designation` VARCHAR(100) NOT NULL,
  `manager_id` INT NULL,
  `salary` DECIMAL(10,2) NOT NULL DEFAULT 50000.00,
  `date_of_joining` DATE NOT NULL,
  `work_type` ENUM('Full-time', 'Part-time', 'Contract', 'Remote') DEFAULT 'Full-time',
  `status` ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `employees` (`id`, `user_id`, `employee_code`, `first_name`, `last_name`, `email`, `phone`, `department_id`, `designation`, `manager_id`, `salary`, `date_of_joining`, `work_type`, `status`) VALUES
(1, 4, 'EMP101', 'Rahul', 'Sharma', 'rahul@company.com', '9876543210', 1, 'Senior Developer', 3, 75000.00, '2023-01-15', 'Full-time', 'Active'),
(2, 2, 'EMP102', 'Priya', 'Singh', 'hr@company.com', '9876543211', 2, 'HR Lead', NULL, 68000.00, '2022-05-10', 'Full-time', 'Active'),
(3, 3, 'EMP103', 'Vikram', 'Mehta', 'manager@company.com', '9876543212', 1, 'Engineering Manager', NULL, 110000.00, '2021-08-01', 'Full-time', 'Active'),
(4, NULL, 'EMP104', 'Neha', 'Verma', 'neha@company.com', '9876543213', 4, 'Financial Analyst', NULL, 55000.00, '2023-04-12', 'Remote', 'Active'),
(5, NULL, 'EMP105', 'Amit', 'Gupta', 'amit@company.com', '9876543214', 3, 'Marketing Specialist', NULL, 52000.00, '2023-09-01', 'Full-time', 'Active');

-- 4. Attendance table
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `check_in` TIME NULL,
  `check_out` TIME NULL,
  `break_minutes` INT DEFAULT 0,
  `working_hours` DECIMAL(4,2) DEFAULT 0.00,
  `status` ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Present',
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `attendance` (`employee_id`, `date`, `check_in`, `check_out`, `break_minutes`, `working_hours`, `status`) VALUES
(1, CURRENT_DATE(), '09:00:00', '17:30:00', 45, 7.75, 'Present'),
(2, CURRENT_DATE(), '09:15:00', '17:45:00', 60, 7.50, 'Present'),
(3, CURRENT_DATE(), '08:50:00', '18:00:00', 30, 8.66, 'Present'),
(4, CURRENT_DATE(), '09:05:00', NULL, 0, 4.50, 'Present');

-- 5. Timesheets table (Time Tracking)
CREATE TABLE IF NOT EXISTS `timesheets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NULL,
  `total_hours` DECIMAL(4,2) DEFAULT 0.00,
  `task_description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `timesheets` (`employee_id`, `date`, `start_time`, `end_time`, `total_hours`, `task_description`) VALUES
(1, CURRENT_DATE(), '09:30:00', '13:00:00', 3.50, 'Developed backend API endpoints for project module'),
(1, CURRENT_DATE(), '14:00:00', '17:30:00', 3.50, 'Frontend UI component integration and testing');

-- 6. Leaves table
CREATE TABLE IF NOT EXISTS `leaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `leave_type` ENUM('Casual', 'Sick', 'Paid', 'Unpaid') DEFAULT 'Casual',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_days` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `approved_by` VARCHAR(100) NULL,
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `leaves` (`employee_id`, `leave_type`, `start_date`, `end_date`, `total_days`, `reason`, `status`) VALUES
(5, 'Sick', '2026-09-10', '2026-09-11', 2, 'Medical checkup and recovery', 'Pending'),
(4, 'Casual', '2026-09-15', '2026-09-15', 1, 'Personal work', 'Approved');

-- 7. Projects table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `description` TEXT,
  `manager_id` INT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `status` ENUM('Planning', 'Active', 'Completed', 'On Hold') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`manager_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `projects` (`id`, `name`, `code`, `description`, `manager_id`, `start_date`, `end_date`, `status`) VALUES
(1, 'Enterprise HR Portal', 'PROJ-HR', 'Building complete employee lifecycle & productivity system', 3, '2026-08-01', '2026-11-30', 'Active'),
(2, 'Customer CRM Redesign', 'PROJ-CRM', 'Revamping sales funnel and customer tracking dashboard', 3, '2026-07-15', '2026-10-15', 'Active');

-- 8. Tasks table
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `assigned_to` INT NOT NULL,
  `created_by` INT NOT NULL,
  `priority` ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
  `status` ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
  `due_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tasks` (`project_id`, `title`, `description`, `assigned_to`, `created_by`, `priority`, `status`, `due_date`) VALUES
(1, 'Implement Attendance API', 'Create PHP endpoints for check-in and check-out tracking', 1, 3, 'High', 'Completed', '2026-09-05'),
(1, 'Design Task Kanban Board', 'Create React frontend view for managing project tasks', 1, 3, 'Medium', 'In Progress', '2026-09-12'),
(2, 'Draft Sales Pipeline Report', 'Gather Q3 marketing metrics and prepare report', 5, 3, 'Urgent', 'Pending', '2026-09-08');

-- 9. Productivity Logs table
CREATE TABLE IF NOT EXISTS `productivity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `active_hours` DECIMAL(4,2) DEFAULT 7.50,
  `idle_hours` DECIMAL(4,2) DEFAULT 0.50,
  `app_usage_json` TEXT NULL,
  `productivity_score` INT DEFAULT 92,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `productivity_logs` (`employee_id`, `date`, `active_hours`, `idle_hours`, `app_usage_json`, `productivity_score`) VALUES
(1, CURRENT_DATE(), 7.50, 0.40, '{"VS Code": "4.5h", "Browser": "2.0h", "Slack": "1.0h"}', 94),
(2, CURRENT_DATE(), 6.80, 0.70, '{"Email": "3.0h", "Excel": "2.5h", "Browser": "1.3h"}', 88),
(3, CURRENT_DATE(), 7.80, 0.20, '{"Zoom": "3.5h", "Jira": "2.5h", "VS Code": "1.8h"}', 96);

-- 10. Payroll table (Salary & Payslips)
CREATE TABLE IF NOT EXISTS `payroll` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `month_year` VARCHAR(20) NOT NULL,
  `basic_salary` DECIMAL(10,2) NOT NULL DEFAULT 50000.00,
  `hra` DECIMAL(10,2) NOT NULL DEFAULT 15000.00,
  `allowances` DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  `bonuses` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax_deduction` DECIMAL(10,2) NOT NULL DEFAULT 4000.00,
  `pf_deduction` DECIMAL(10,2) NOT NULL DEFAULT 2400.00,
  `net_salary` DECIMAL(10,2) NOT NULL DEFAULT 63600.00,
  `status` ENUM('Paid', 'Pending', 'Processing') DEFAULT 'Paid',
  `payment_date` DATE NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Direct Bank Transfer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payroll` (`employee_id`, `month_year`, `basic_salary`, `hra`, `allowances`, `bonuses`, `tax_deduction`, `pf_deduction`, `net_salary`, `status`, `payment_date`, `payment_method`) VALUES
(1, '2026-09', 45000.00, 18000.00, 12000.00, 5000.00, 4500.00, 2400.00, 73100.00, 'Paid', '2026-09-01', 'Direct Bank Transfer'),
(2, '2026-09', 40000.00, 16000.00, 12000.00, 2000.00, 4000.00, 2400.00, 63600.00, 'Paid', '2026-09-01', 'Direct Bank Transfer'),
(3, '2026-09', 65000.00, 26000.00, 19000.00, 10000.00, 8500.00, 3600.00, 107900.00, 'Paid', '2026-09-01', 'Direct Bank Transfer'),
(4, '2026-09', 32000.00, 13000.00, 10000.00, 0.00, 3000.00, 2000.00, 50000.00, 'Pending', NULL, 'Direct Bank Transfer'),
(5, '2026-09', 30000.00, 12000.00, 10000.00, 1500.00, 2800.00, 1900.00, 48800.00, 'Processing', NULL, 'Direct Bank Transfer');


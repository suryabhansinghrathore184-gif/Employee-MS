# Enterprise Employee Management System

A full-stack enterprise **Employee Management System** built with **React (Vite) + Tailwind CSS**, **PHP REST API**, and **MySQL (phpMyAdmin)**.

---

## 🚀 Key Modules & Features

1. **Dashboard**: Role-customized dashboard showing 8 live metric cards (*Total Employees, Present Today, Absent Today, Pending Leaves, Active Projects, Completed Tasks, Working Hours Logged Today, Avg Productivity %*).
2. **Employee Management**: Comprehensive employee directory with search, department filtering, role assignment (*Admin, HR, Manager, Employee*), work types (*Full-time, Part-time, Contract, Remote*), and full CRUD.
3. **Attendance Management**: Daily Check-In / Check-Out widget, working hours calculation, and monthly attendance history.
4. **Time Tracking**: Live Start / Stop work timer, timesheet logging, and task time reports.
5. **Leave Management**: Leave application form (*Casual, Sick, Paid, Unpaid*), HR & Manager Approval/Rejection workflow, and leave balance summary.
6. **Project & Task Management**: Project creation, team assignment, task creation with priorities (*Low, Medium, High, Urgent*), due dates, and status progression (*Pending -> In Progress -> Completed*).
7. **Productivity Management**: Active vs idle hours breakdown, application usage breakdown, productivity score calculation, and responsible privacy controls.
8. **Reports & Analytics Engine**: Multi-filter reporting engine (*Attendance, Leave, Projects/Tasks, Productivity*) filterable by department and printable/exportable.
9. **Role-Based Authentication**: Secure login supporting **Admin**, **HR**, **Manager**, and **Employee** permission levels.

---

## 🔑 Demo Accounts & Login Credentials

Select any role on the login screen or use the following credentials:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access to all 9 modules, system settings & departments |
| **HR Lead** | `hr` | `hr123` | Employee CRUD, attendance oversight, leave approvals, HR reports |
| **Manager** | `manager` | `manager123` | Assigned team oversight, project creation, task assignment, leave approvals |
| **Employee** | `employee` | `emp123` | Personal dashboard, Check-In/Out, Start/Stop time tracking, leave requests, my tasks |

---

## 🛠️ XAMPP & Database Setup

1. **Start XAMPP Control Panel**:
   Ensure **Apache** and **MySQL** services are running.

2. **phpMyAdmin Database Import**:
   - Open browser: **http://localhost/phpmyadmin**
   - Click **Import** tab.
   - Choose file: `D:\PHP\htdocs\EmployeeMang\database\schema.sql`
   - Click **Import**.

3. **Start React Frontend**:
   ```bash
   cd D:\PHP\htdocs\EmployeeMang
   npm run dev
   ```
   Open browser at `http://localhost:3000` or `http://localhost:5173`.

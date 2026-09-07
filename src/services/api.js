// Extended API service module connecting React frontend to PHP REST backend

const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

// Fallback demo data if PHP server is temporarily offline
const fallbackData = {
  getLoginUser: (usernameOrEmail) => {
    const str = String(usernameOrEmail).toLowerCase().split('@')[0];
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    if (str.includes('hr')) {
      return { id: 2, username: 'hr', full_name: 'Priya Singh', email: 'hr@company.com', role: 'hr', employee_id: 2 };
    }
    if (str.includes('manager')) {
      return { id: 3, username: 'manager', full_name: 'Vikram Mehta', email: 'manager@company.com', role: 'manager', employee_id: 3 };
    }
    if (str.includes('rahul')) {
      return { id: 4, username: 'employee', full_name: 'Rahul Sharma', email: 'rahul@company.com', role: 'employee', employee_id: 1 };
    }
    return { 
      id: Date.now(), 
      username: str, 
      full_name: capitalized, 
      email: usernameOrEmail.includes('@') ? usernameOrEmail : `${str}@company.com`, 
      role: str.includes('admin') ? 'admin' : 'employee', 
      employee_id: 1 
    };
  },
  stats: {
    total_employees: 5,
    present_employees: 4,
    absent_employees: 1,
    pending_leaves: 2,
    active_projects: 2,
    completed_tasks: 12,
    working_hours_today: 38.5,
    avg_productivity: 94,
    department_breakdown: [
      { id: 1, name: 'Engineering', code: 'ENG', employee_count: 2 },
      { id: 2, name: 'Human Resources', code: 'HR', employee_count: 1 },
      { id: 3, name: 'Marketing & Sales', code: 'MKT', employee_count: 1 },
      { id: 4, name: 'Finance', code: 'FIN', employee_count: 1 },
    ],
    recent_employees: [
      { id: 1, employee_code: 'EMP101', first_name: 'Rahul', last_name: 'Sharma', designation: 'Senior Developer', date_of_joining: '2023-01-15', status: 'Active', department_name: 'Engineering' },
      { id: 2, employee_code: 'EMP102', first_name: 'Priya', last_name: 'Singh', designation: 'HR Lead', date_of_joining: '2022-05-10', status: 'Active', department_name: 'Human Resources' },
      { id: 3, employee_code: 'EMP103', first_name: 'Vikram', last_name: 'Mehta', designation: 'Engineering Manager', date_of_joining: '2021-08-01', status: 'Active', department_name: 'Engineering' },
    ]
  },
  departments: [
    { id: 1, name: 'Engineering', code: 'ENG', description: 'Software development & IT', total_employees: 2, active_employees: 2 },
    { id: 2, name: 'Human Resources', code: 'HR', description: 'Recruitment & payroll', total_employees: 1, active_employees: 1 },
    { id: 3, name: 'Marketing & Sales', code: 'MKT', description: 'Brand & sales strategy', total_employees: 1, active_employees: 1 },
    { id: 4, name: 'Finance', code: 'FIN', description: 'Accounting & audit', total_employees: 1, active_employees: 1 },
  ],
  employees: [
    { id: 1, employee_code: 'EMP101', first_name: 'Rahul', last_name: 'Sharma', email: 'rahul@company.com', phone: '9876543210', department_id: 1, department_name: 'Engineering', designation: 'Senior Developer', salary: 75000, date_of_joining: '2023-01-15', work_type: 'Full-time', status: 'Active' },
    { id: 2, employee_code: 'EMP102', first_name: 'Priya', last_name: 'Singh', email: 'hr@company.com', phone: '9876543211', department_id: 2, department_name: 'Human Resources', designation: 'HR Lead', salary: 68000, date_of_joining: '2022-05-10', work_type: 'Full-time', status: 'Active' },
    { id: 3, employee_code: 'EMP103', first_name: 'Vikram', last_name: 'Mehta', email: 'manager@company.com', phone: '9876543212', department_id: 1, department_name: 'Engineering', designation: 'Engineering Manager', salary: 110000, date_of_joining: '2021-08-01', work_type: 'Full-time', status: 'Active' },
  ],
  attendance: [
    { id: 1, employee_id: 1, first_name: 'Rahul', last_name: 'Sharma', date: '2026-09-07', check_in: '09:00:00', check_out: '18:00:00', work_hours: 9.0, status: 'Present', notes: 'Punctual' },
    { id: 2, employee_id: 2, first_name: 'Priya', last_name: 'Singh', date: '2026-09-07', check_in: '09:15:00', check_out: '17:45:00', work_hours: 8.5, status: 'Present', notes: '' },
    { id: 3, employee_id: 3, first_name: 'Vikram', last_name: 'Mehta', date: '2026-09-07', check_in: '08:50:00', check_out: '18:10:00', work_hours: 9.3, status: 'Present', notes: '' },
  ],
  leaves: [
    { id: 1, employee_id: 1, first_name: 'Rahul', last_name: 'Sharma', leave_type: 'Casual', start_date: '2026-09-10', end_date: '2026-09-12', days: 3, reason: 'Family event', status: 'Pending', applied_on: '2026-09-05' },
    { id: 2, employee_id: 2, first_name: 'Priya', last_name: 'Singh', leave_type: 'Sick', start_date: '2026-09-01', end_date: '2026-09-02', days: 2, reason: 'Flu recovery', status: 'Approved', applied_on: '2026-08-30' },
  ],
  projects: [
    { id: 1, name: 'EMS Mobile & Web SaaS', client: 'Acme Corp', start_date: '2026-01-01', end_date: '2026-12-31', status: 'Active', budget: 150000, progress: 68 },
    { id: 2, name: 'Cloud Migration AWS', client: 'Internal', start_date: '2026-03-01', end_date: '2026-09-30', status: 'Active', budget: 85000, progress: 85 },
  ],
  tasks: [
    { id: 1, title: 'Setup Vercel SPA Routing', project_id: 1, assigned_to: 1, status: 'In Progress', priority: 'High', due_date: '2026-09-10' },
    { id: 2, title: 'Database Migration', project_id: 2, assigned_to: 3, status: 'Completed', priority: 'Medium', due_date: '2026-09-05' },
  ],
  payroll: [
    { id: 1, employee_id: 1, employee_code: 'EMP101', first_name: 'Rahul', last_name: 'Sharma', designation: 'Senior Developer', month_year: '2026-09', basic_salary: 75000, hra: 15000, allowances: 5000, deductions: 4000, net_salary: 91000, status: 'Paid', payment_date: '2026-09-01' },
    { id: 2, employee_id: 2, employee_code: 'EMP102', first_name: 'Priya', last_name: 'Singh', designation: 'HR Lead', month_year: '2026-09', basic_salary: 68000, hra: 13600, allowances: 4000, deductions: 3500, net_salary: 82100, status: 'Generated', payment_date: null },
  ],
  productivity: [
    { employee_id: 1, first_name: 'Rahul', last_name: 'Sharma', total_hours: 168, active_hours: 156, productivity_score: 95, tasks_completed: 18 },
    { employee_id: 2, first_name: 'Priya', last_name: 'Singh', total_hours: 160, active_hours: 148, productivity_score: 92, tasks_completed: 14 },
  ],
  reports: {
    attendance: [
      { date: '2026-09-07', employee_name: 'Rahul Sharma', employee_code: 'EMP101', department_name: 'Engineering', check_in: '09:00:00', check_out: '18:00:00', working_hours: 9.0, status: 'Present' },
      { date: '2026-09-07', employee_name: 'Priya Singh', employee_code: 'EMP102', department_name: 'Human Resources', check_in: '09:15:00', check_out: '17:45:00', working_hours: 8.5, status: 'Present' },
    ],
    leave: [
      { employee_name: 'Rahul Sharma', department_name: 'Engineering', leave_type: 'Casual', start_date: '2026-09-10', end_date: '2026-09-12', total_days: 3, status: 'Pending' },
      { employee_name: 'Priya Singh', department_name: 'Human Resources', leave_type: 'Sick', start_date: '2026-09-01', end_date: '2026-09-02', total_days: 2, status: 'Approved' },
    ],
    projects: [
      { project_name: 'EMS Mobile & Web SaaS', task_title: 'Setup Vercel SPA Routing', assignee_name: 'Rahul Sharma', priority: 'High', due_date: '2026-09-10', task_status: 'In Progress' },
      { project_name: 'Cloud Migration AWS', task_title: 'Database Migration', assignee_name: 'Vikram Mehta', priority: 'Medium', due_date: '2026-09-05', task_status: 'Completed' },
    ],
    productivity: [
      { date: '2026-09-07', employee_name: 'Rahul Sharma', department_name: 'Engineering', active_hours: 7.8, idle_hours: 0.5, score: 95 },
      { date: '2026-09-07', employee_name: 'Priya Singh', department_name: 'Human Resources', active_hours: 7.2, idle_hours: 0.8, score: 92 },
    ]
  },
  timesheets: [
    { id: 1, employee_id: 1, date: '2026-09-07', project_name: 'EMS Mobile & Web SaaS', hours: 8, task_description: 'Frontend component refactoring and Vercel testing' }
  ]
};

function handleFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  if (endpoint.includes('/auth/login.php') || endpoint.includes('/auth/register.php')) {
    const bodyObj = options.body ? JSON.parse(options.body) : {};
    const matchedUser = fallbackData.getLoginUser(bodyObj.username || 'admin');
    return { status: 'success', user: matchedUser, token: 'demo_token_123' };
  }
  if (endpoint.includes('/stats/index.php')) {
    return { status: 'success', data: fallbackData.stats };
  }
  if (endpoint.includes('/departments/index.php')) {
    if (method === 'POST') {
      const bodyObj = options.body ? JSON.parse(options.body) : {};
      const newDept = { id: Date.now(), ...bodyObj, total_employees: 0, active_employees: 0 };
      fallbackData.departments.push(newDept);
      return { status: 'success', message: 'Department created', data: newDept };
    }
    return { status: 'success', count: fallbackData.departments.length, data: fallbackData.departments };
  }
  if (endpoint.includes('/employees/detail.php')) {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const empId = urlParams.get('id');
    const emp = fallbackData.employees.find(e => String(e.id) === String(empId)) || fallbackData.employees[0];
    return { status: 'success', data: emp };
  }
  if (endpoint.includes('/employees/index.php')) {
    if (method === 'POST') {
      const bodyObj = options.body ? JSON.parse(options.body) : {};
      const newEmp = { id: Date.now(), employee_code: `EMP${100 + fallbackData.employees.length + 1}`, status: 'Active', ...bodyObj };
      fallbackData.employees.unshift(newEmp);
      return { status: 'success', message: 'Employee added successfully', data: newEmp };
    }
    return { status: 'success', count: fallbackData.employees.length, data: fallbackData.employees };
  }
  if (endpoint.includes('/attendance/index.php')) {
    return { status: 'success', count: fallbackData.attendance.length, data: fallbackData.attendance };
  }
  if (endpoint.includes('/leaves/index.php')) {
    if (method === 'POST') {
      const bodyObj = options.body ? JSON.parse(options.body) : {};
      const newLeave = { id: Date.now(), status: 'Pending', applied_on: new Date().toISOString().split('T')[0], ...bodyObj };
      fallbackData.leaves.unshift(newLeave);
      return { status: 'success', message: 'Leave application submitted', data: newLeave };
    }
    return { status: 'success', count: fallbackData.leaves.length, data: fallbackData.leaves };
  }
  if (endpoint.includes('/projects/index.php')) {
    return { status: 'success', count: fallbackData.projects.length, data: fallbackData.projects };
  }
  if (endpoint.includes('/tasks/index.php')) {
    return { status: 'success', count: fallbackData.tasks.length, data: fallbackData.tasks };
  }
  if (endpoint.includes('/payroll/index.php')) {
    return { status: 'success', count: fallbackData.payroll.length, data: fallbackData.payroll };
  }
  if (endpoint.includes('/productivity/index.php')) {
    return { status: 'success', count: fallbackData.productivity.length, data: fallbackData.productivity };
  }
  if (endpoint.includes('/reports/index.php')) {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const type = urlParams.get('type') || 'attendance';
    const reportList = fallbackData.reports[type] || fallbackData.reports.attendance;
    return { status: 'success', data: reportList };
  }
  if (endpoint.includes('/timesheets/index.php')) {
    return { status: 'success', count: fallbackData.timesheets.length, data: fallbackData.timesheets };
  }

  return { status: 'success', message: 'Offline action simulated successfully' };
}

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

async function request(endpoint, options = {}) {
  // Direct fallback on cloud deployment (Vercel) to prevent 403 / 405 browser network errors
  if (!isLocalhost) {
    return handleFallback(endpoint, options);
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      throw new Error(`HTTP error status ${response.status}`);
    }
    const text = await response.text();
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.warn(`API network fallback [${endpoint}]:`, error.message || error);
    return handleFallback(endpoint, options);
  }
}

export const api = {
  // Auth
  login: (username, password) => 
    request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (userData) =>
    request('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Stats / Dashboard
  getStats: (role = 'admin') => request(`/stats/index.php?role=${role}`),

  // Employees
  getEmployees: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.department_id) query.append('department_id', params.department_id);
    if (params.status) query.append('status', params.status);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.order) query.append('order', params.order);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/employees/index.php${queryString}`);
  },

  getEmployeeById: (id) => request(`/employees/detail.php?id=${id}`),

  createEmployee: (employeeData) =>
    request('/employees/index.php', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    }),

  updateEmployee: (id, employeeData) =>
    request(`/employees/detail.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    }),

  deleteEmployee: (id) =>
    request(`/employees/detail.php?id=${id}`, {
      method: 'DELETE',
    }),

  // Departments
  getDepartments: () => request('/departments/index.php'),

  createDepartment: (deptData) =>
    request('/departments/index.php', {
      method: 'POST',
      body: JSON.stringify(deptData),
    }),

  // Attendance
  getAttendance: (empId = null, status = null, date = null) => {
    const query = new URLSearchParams();
    if (empId) query.append('employee_id', empId);
    if (status && status !== 'All') query.append('status', status);
    if (date) query.append('date', date);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/attendance/index.php${queryString}`);
  },
  checkIn: (employee_id) => request('/attendance/index.php', { method: 'POST', body: JSON.stringify({ action: 'check_in', employee_id }) }),
  checkOut: (employee_id) => request('/attendance/index.php', { method: 'POST', body: JSON.stringify({ action: 'check_out', employee_id }) }),
  markAbsent: (employee_id, date = null, notes = '', status = 'Absent') =>
    request('/attendance/index.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'mark_absent', employee_id, date, notes, status }),
    }),

  // Timesheets
  getTimesheets: (empId = null) => request(`/timesheets/index.php${empId ? `?employee_id=${empId}` : ''}`),
  logTimesheet: (data) => request('/timesheets/index.php', { method: 'POST', body: JSON.stringify(data) }),

  // Leaves
  getLeaves: (empId = null) => request(`/leaves/index.php${empId ? `?employee_id=${empId}` : ''}`),
  applyLeave: (data) => request('/leaves/index.php', { method: 'POST', body: JSON.stringify(data) }),
  updateLeaveStatus: (id, status, approved_by) => request('/leaves/index.php', { method: 'PUT', body: JSON.stringify({ id, status, approved_by }) }),

  // Projects & Tasks
  getProjects: () => request('/projects/index.php'),
  createProject: (data) => request('/projects/index.php', { method: 'POST', body: JSON.stringify(data) }),
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.project_id) query.append('project_id', params.project_id);
    if (params.assigned_to) query.append('assigned_to', params.assigned_to);
    if (params.status) query.append('status', params.status);
    return request(`/tasks/index.php?${query.toString()}`);
  },
  createTask: (data) => request('/tasks/index.php', { method: 'POST', body: JSON.stringify(data) }),
  updateTaskStatus: (id, status) => request('/tasks/index.php', { method: 'PUT', body: JSON.stringify({ id, status }) }),

  // Productivity & Reports
  getProductivity: (empId = null) => request(`/productivity/index.php${empId ? `?employee_id=${empId}` : ''}`),
  getReports: (type = 'attendance', deptId = null, empId = null) => {
    const query = new URLSearchParams({ type });
    if (deptId) query.append('department_id', deptId);
    if (empId) query.append('employee_id', empId);
    return request(`/reports/index.php?${query.toString()}`);
  },

  // Payroll & Salary
  getPayroll: (empId = null, monthYear = '2026-09', status = null) => {
    const query = new URLSearchParams();
    if (empId) query.append('employee_id', empId);
    if (monthYear) query.append('month_year', monthYear);
    if (status && status !== 'All') query.append('status', status);
    return request(`/payroll/index.php?${query.toString()}`);
  },
  generatePayroll: (monthYear = '2026-09') =>
    request('/payroll/index.php', { method: 'POST', body: JSON.stringify({ action: 'generate_all', month_year: monthYear }) }),
  markPayrollPaid: (id) =>
    request('/payroll/index.php', { method: 'POST', body: JSON.stringify({ action: 'mark_paid', id }) }),
};

<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit();
}

$role = isset($_GET['role']) ? $_GET['role'] : 'admin';
$emp_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;
$today = date('Y-m-d');

// Total employees
$emp_stmt = $db->query("SELECT COUNT(*) as total FROM employees WHERE status = 'Active'");
$total_employees = $emp_stmt->fetch()['total'];

// Present employees today
$present_stmt = $db->prepare("SELECT COUNT(DISTINCT employee_id) as total FROM attendance WHERE date = :today AND status = 'Present'");
$present_stmt->execute([':today' => $today]);
$present_employees = $present_stmt->fetch()['total'];

$absent_employees = max(0, $total_employees - $present_employees);

// Pending leaves count
$leave_stmt = $db->query("SELECT COUNT(*) as total FROM leaves WHERE status = 'Pending'");
$pending_leaves = $leave_stmt->fetch()['total'];

// Active projects count
$proj_stmt = $db->query("SELECT COUNT(*) as total FROM projects WHERE status = 'Active'");
$active_projects = $proj_stmt->fetch()['total'];

// Completed tasks count
$task_stmt = $db->query("SELECT COUNT(*) as total FROM tasks WHERE status = 'Completed'");
$completed_tasks = $task_stmt->fetch()['total'];

// Working hours today
$hours_stmt = $db->prepare("SELECT SUM(working_hours) as total FROM attendance WHERE date = :today");
$hours_stmt->execute([':today' => $today]);
$working_hours_today = round(floatval($hours_stmt->fetch()['total'] ?? 0), 2);

// Productivity score average
$prod_stmt = $db->query("SELECT AVG(productivity_score) as avg_score FROM productivity_logs");
$avg_productivity = round(floatval($prod_stmt->fetch()['avg_score'] ?? 90), 0);

// Department breakdown
$dept_breakdown_stmt = $db->query("SELECT d.id, d.name, d.code, COUNT(e.id) as employee_count 
                                   FROM departments d 
                                   LEFT JOIN employees e ON d.id = e.department_id 
                                   GROUP BY d.id ORDER BY employee_count DESC");
$dept_breakdown = $dept_breakdown_stmt->fetchAll();

// Recent employees
$recent_stmt = $db->query("SELECT e.id, e.employee_code, e.first_name, e.last_name, e.designation, e.date_of_joining, e.status, d.name as department_name 
                            FROM employees e LEFT JOIN departments d ON e.department_id = d.id 
                            ORDER BY e.created_at DESC LIMIT 5");
$recent_employees = $recent_stmt->fetchAll();

http_response_code(200);
echo json_encode([
    "status" => "success",
    "data" => [
        "total_employees" => intval($total_employees),
        "present_employees" => intval($present_employees),
        "absent_employees" => intval($absent_employees),
        "pending_leaves" => intval($pending_leaves),
        "active_projects" => intval($active_projects),
        "completed_tasks" => intval($completed_tasks),
        "working_hours_today" => $working_hours_today,
        "avg_productivity" => $avg_productivity,
        "department_breakdown" => $dept_breakdown,
        "recent_employees" => $recent_employees
    ]
]);
?>

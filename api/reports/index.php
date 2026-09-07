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

$type = isset($_GET['type']) ? $_GET['type'] : 'attendance';
$dept_id = isset($_GET['department_id']) && $_GET['department_id'] !== '' ? intval($_GET['department_id']) : null;
$emp_id = isset($_GET['employee_id']) && $_GET['employee_id'] !== '' ? intval($_GET['employee_id']) : null;

$data = [];

if ($type === 'attendance') {
    $query = "SELECT a.date, a.status, a.check_in, a.check_out, a.working_hours,
                     CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_code, d.name as department_name
              FROM attendance a
              JOIN employees e ON a.employee_id = e.id
              LEFT JOIN departments d ON e.department_id = d.id
              WHERE 1=1";
    $params = [];
    if ($dept_id) { $query .= " AND e.department_id = :dept_id"; $params[':dept_id'] = $dept_id; }
    if ($emp_id) { $query .= " AND a.employee_id = :emp_id"; $params[':emp_id'] = $emp_id; }
    $query .= " ORDER BY a.date DESC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
} else if ($type === 'leave') {
    $query = "SELECT l.leave_type, l.start_date, l.end_date, l.total_days, l.reason, l.status, l.applied_at,
                     CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_code, d.name as department_name
              FROM leaves l
              JOIN employees e ON l.employee_id = e.id
              LEFT JOIN departments d ON e.department_id = d.id
              WHERE 1=1";
    $params = [];
    if ($dept_id) { $query .= " AND e.department_id = :dept_id"; $params[':dept_id'] = $dept_id; }
    if ($emp_id) { $query .= " AND l.employee_id = :emp_id"; $params[':emp_id'] = $emp_id; }
    $query .= " ORDER BY l.applied_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
} else if ($type === 'projects') {
    $query = "SELECT p.name as project_name, p.code as project_code, p.status as project_status,
                     t.title as task_title, t.priority, t.status as task_status, t.due_date,
                     CONCAT(e.first_name, ' ', e.last_name) as assignee_name
              FROM tasks t
              JOIN projects p ON t.project_id = p.id
              JOIN employees e ON t.assigned_to = e.id
              WHERE 1=1";
    $params = [];
    if ($dept_id) { $query .= " AND e.department_id = :dept_id"; $params[':dept_id'] = $dept_id; }
    if ($emp_id) { $query .= " AND t.assigned_to = :emp_id"; $params[':emp_id'] = $emp_id; }
    $query .= " ORDER BY t.due_date ASC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
} else {
    // Default productivity summary report
    $query = "SELECT p.date, p.active_hours, p.idle_hours, p.productivity_score,
                     CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_code, d.name as department_name
              FROM productivity_logs p
              JOIN employees e ON p.employee_id = e.id
              LEFT JOIN departments d ON e.department_id = d.id
              WHERE 1=1";
    $params = [];
    if ($dept_id) { $query .= " AND e.department_id = :dept_id"; $params[':dept_id'] = $dept_id; }
    if ($emp_id) { $query .= " AND p.employee_id = :emp_id"; $params[':emp_id'] = $emp_id; }
    $query .= " ORDER BY p.date DESC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
}

http_response_code(200);
echo json_encode(["status" => "success", "type" => $type, "count" => count($data), "data" => $data]);
?>

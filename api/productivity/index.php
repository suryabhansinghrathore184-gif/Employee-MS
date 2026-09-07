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

$emp_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;

$query = "SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_code, d.name as department_name
          FROM productivity_logs p
          JOIN employees e ON p.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          WHERE 1=1";
$params = [];

if ($emp_id) {
    $query .= " AND p.employee_id = :emp_id";
    $params[':emp_id'] = $emp_id;
}

$query .= " ORDER BY p.date DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$logs = $stmt->fetchAll();

// Parse app_usage_json
foreach ($logs as &$log) {
    if (!empty($log['app_usage_json'])) {
        $log['app_usage'] = json_decode($log['app_usage_json'], true);
    } else {
        $log['app_usage'] = [];
    }
}

http_response_code(200);
echo json_encode(["status" => "success", "count" => count($logs), "data" => $logs]);
?>

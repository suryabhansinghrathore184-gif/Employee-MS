<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $emp_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;

    $query = "SELECT l.*, e.first_name, e.last_name, e.employee_code, d.name as department_name 
              FROM leaves l 
              JOIN employees e ON l.employee_id = e.id 
              LEFT JOIN departments d ON e.department_id = d.id 
              WHERE 1=1";
    $params = [];

    if ($emp_id) {
        $query .= " AND l.employee_id = :emp_id";
        $params[':emp_id'] = $emp_id;
    }

    $query .= " ORDER BY l.applied_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $leaves = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode(["status" => "success", "count" => count($leaves), "data" => $leaves]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['employee_id']) || empty($data['start_date']) || empty($data['end_date']) || empty($data['reason'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Required fields missing."]);
        exit();
    }

    $emp_id = intval($data['employee_id']);
    $leave_type = !empty($data['leave_type']) ? $data['leave_type'] : 'Casual';
    $start = $data['start_date'];
    $end = $data['end_date'];
    $reason = trim($data['reason']);

    $days = max(1, round((strtotime($end) - strtotime($start)) / (60 * 60 * 24)) + 1);

    $stmt = $db->prepare("INSERT INTO leaves (employee_id, leave_type, start_date, end_date, total_days, reason, status) 
                          VALUES (:emp_id, :leave_type, :start, :end, :days, :reason, 'Pending')");
    $result = $stmt->execute([
        ':emp_id' => $emp_id,
        ':leave_type' => $leave_type,
        ':start' => $start,
        ':end' => $end,
        ':days' => $days,
        ':reason' => $reason
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Leave application submitted successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to apply for leave."]);
    }
    exit();
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['id']) || empty($data['status'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Leave ID and status are required."]);
        exit();
    }

    $id = intval($data['id']);
    $status = $data['status']; // Approved or Rejected
    $approved_by = !empty($data['approved_by']) ? $data['approved_by'] : 'Admin';

    $stmt = $db->prepare("UPDATE leaves SET status = :status, approved_by = :approved_by WHERE id = :id");
    $result = $stmt->execute([':status' => $status, ':approved_by' => $approved_by, ':id' => $id]);

    if ($result) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Leave request updated to " . $status]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update leave request."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

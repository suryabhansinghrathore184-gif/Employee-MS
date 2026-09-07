<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $emp_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;

    $query = "SELECT t.*, e.first_name, e.last_name, e.employee_code 
              FROM timesheets t 
              JOIN employees e ON t.employee_id = e.id 
              WHERE 1=1";
    $params = [];

    if ($emp_id) {
        $query .= " AND t.employee_id = :emp_id";
        $params[':emp_id'] = $emp_id;
    }

    $query .= " ORDER BY t.date DESC, t.id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $timesheets = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode(["status" => "success", "count" => count($timesheets), "data" => $timesheets]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['employee_id']) || empty($data['task_description'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Employee ID and task description are required."]);
        exit();
    }

    $emp_id = intval($data['employee_id']);
    $date = !empty($data['date']) ? $data['date'] : date('Y-m-d');
    $start_time = !empty($data['start_time']) ? $data['start_time'] : date('H:i:s');
    $end_time = !empty($data['end_time']) ? $data['end_time'] : date('H:i:s');
    $hours = !empty($data['total_hours']) ? floatval($data['total_hours']) : 1.0;
    $desc = trim($data['task_description']);

    $stmt = $db->prepare("INSERT INTO timesheets (employee_id, date, start_time, end_time, total_hours, task_description) 
                          VALUES (:emp_id, :date, :start_time, :end_time, :hours, :desc)");
    $result = $stmt->execute([
        ':emp_id' => $emp_id,
        ':date' => $date,
        ':start_time' => $start_time,
        ':end_time' => $end_time,
        ':hours' => $hours,
        ':desc' => $desc
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Timesheet entry logged successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to log timesheet."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

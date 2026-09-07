<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $query = "SELECT p.*, 
                     CONCAT(e.first_name, ' ', e.last_name) as manager_name,
                     COUNT(t.id) as total_tasks,
                     SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
              FROM projects p 
              LEFT JOIN employees e ON p.manager_id = e.id 
              LEFT JOIN tasks t ON p.id = t.project_id 
              GROUP BY p.id 
              ORDER BY p.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $projects = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode(["status" => "success", "count" => count($projects), "data" => $projects]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['name']) || empty($data['code'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Project name and code are required."]);
        exit();
    }

    $name = trim($data['name']);
    $code = strtoupper(trim($data['code']));
    $desc = isset($data['description']) ? trim($data['description']) : '';
    $manager_id = !empty($data['manager_id']) ? intval($data['manager_id']) : null;
    $start = !empty($data['start_date']) ? $data['start_date'] : date('Y-m-d');
    $end = !empty($data['end_date']) ? $data['end_date'] : null;
    $status = !empty($data['status']) ? $data['status'] : 'Active';

    $stmt = $db->prepare("INSERT INTO projects (name, code, description, manager_id, start_date, end_date, status) 
                          VALUES (:name, :code, :desc, :manager_id, :start, :end, :status)");
    $result = $stmt->execute([
        ':name' => $name,
        ':code' => $code,
        ':desc' => $desc,
        ':manager_id' => $manager_id,
        ':start' => $start,
        ':end' => $end,
        ':status' => $status
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Project created successfully.", "id" => $db->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to create project."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

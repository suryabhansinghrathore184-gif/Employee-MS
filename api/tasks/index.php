<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $project_id = isset($_GET['project_id']) ? intval($_GET['project_id']) : null;
    $assigned_to = isset($_GET['assigned_to']) ? intval($_GET['assigned_to']) : null;
    $status = isset($_GET['status']) ? trim($_GET['status']) : null;

    $query = "SELECT t.*, p.name as project_name, p.code as project_code,
                     CONCAT(e.first_name, ' ', e.last_name) as assignee_name
              FROM tasks t 
              JOIN projects p ON t.project_id = p.id 
              JOIN employees e ON t.assigned_to = e.id 
              WHERE 1=1";
    $params = [];

    if ($project_id) {
        $query .= " AND t.project_id = :project_id";
        $params[':project_id'] = $project_id;
    }
    if ($assigned_to) {
        $query .= " AND t.assigned_to = :assigned_to";
        $params[':assigned_to'] = $assigned_to;
    }
    if ($status) {
        $query .= " AND t.status = :status";
        $params[':status'] = $status;
    }

    $query .= " ORDER BY t.due_date ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $tasks = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode(["status" => "success", "count" => count($tasks), "data" => $tasks]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['project_id']) || empty($data['title']) || empty($data['assigned_to'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Project, title, and assigned employee are required."]);
        exit();
    }

    $project_id = intval($data['project_id']);
    $title = trim($data['title']);
    $desc = isset($data['description']) ? trim($data['description']) : '';
    $assigned_to = intval($data['assigned_to']);
    $created_by = !empty($data['created_by']) ? intval($data['created_by']) : 1;
    $priority = !empty($data['priority']) ? $data['priority'] : 'Medium';
    $due_date = !empty($data['due_date']) ? $data['due_date'] : date('Y-m-d', strtotime('+7 days'));

    $stmt = $db->prepare("INSERT INTO tasks (project_id, title, description, assigned_to, created_by, priority, status, due_date) 
                          VALUES (:project_id, :title, :desc, :assigned_to, :created_by, :priority, 'Pending', :due_date)");
    $result = $stmt->execute([
        ':project_id' => $project_id,
        ':title' => $title,
        ':desc' => $desc,
        ':assigned_to' => $assigned_to,
        ':created_by' => $created_by,
        ':priority' => $priority,
        ':due_date' => $due_date
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Task created successfully.", "id" => $db->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to create task."]);
    }
    exit();
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['id']) || empty($data['status'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Task ID and status are required."]);
        exit();
    }

    $stmt = $db->prepare("UPDATE tasks SET status = :status WHERE id = :id");
    $result = $stmt->execute([':status' => $data['status'], ':id' => intval($data['id'])]);

    if ($result) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Task status updated to " . $data['status']]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update task status."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

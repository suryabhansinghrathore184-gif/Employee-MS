<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $query = "SELECT d.*, 
                     COUNT(e.id) as total_employees,
                     SUM(CASE WHEN e.status = 'Active' THEN 1 ELSE 0 END) as active_employees
              FROM departments d 
              LEFT JOIN employees e ON d.id = e.department_id 
              GROUP BY d.id 
              ORDER BY d.name ASC";
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    $departments = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "count" => count($departments),
        "data" => $departments
    ]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['name']) || empty($data['code'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Department name and code are required."]);
        exit();
    }

    $name = trim($data['name']);
    $code = strtoupper(trim($data['code']));
    $description = isset($data['description']) ? trim($data['description']) : '';

    $check_stmt = $db->prepare("SELECT id FROM departments WHERE name = :name OR code = :code LIMIT 1");
    $check_stmt->execute([':name' => $name, ':code' => $code]);
    if ($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "A department with this name or code already exists."]);
        exit();
    }

    $stmt = $db->prepare("INSERT INTO departments (name, code, description) VALUES (:name, :code, :description)");
    $result = $stmt->execute([
        ':name' => $name,
        ':code' => $code,
        ':description' => $description
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Department created successfully.",
            "id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to create department."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

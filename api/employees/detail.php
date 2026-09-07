<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Employee ID is required."]);
    exit();
}

if ($method === 'GET') {
    $stmt = $db->prepare("SELECT e.*, d.name as department_name, d.code as department_code 
                          FROM employees e 
                          LEFT JOIN departments d ON e.department_id = d.id 
                          WHERE e.id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $employee = $stmt->fetch();

    if ($employee) {
        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $employee]);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Employee not found."]);
    }
    exit();
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['first_name']) || empty($data['last_name']) || empty($data['email']) || empty($data['department_id']) || empty($data['designation'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Required fields missing."]);
        exit();
    }

    $check_stmt = $db->prepare("SELECT id FROM employees WHERE email = :email AND id != :id LIMIT 1");
    $check_stmt->execute([':email' => trim($data['email']), ':id' => $id]);
    if ($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Email is already in use by another employee."]);
        exit();
    }

    $query = "UPDATE employees SET 
              first_name = :first_name,
              last_name = :last_name,
              email = :email,
              phone = :phone,
              department_id = :department_id,
              designation = :designation,
              salary = :salary,
              date_of_joining = :date_of_joining,
              status = :status
              WHERE id = :id";

    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':first_name' => trim($data['first_name']),
        ':last_name' => trim($data['last_name']),
        ':email' => trim($data['email']),
        ':phone' => isset($data['phone']) ? trim($data['phone']) : '',
        ':department_id' => intval($data['department_id']),
        ':designation' => trim($data['designation']),
        ':salary' => isset($data['salary']) ? floatval($data['salary']) : 0.00,
        ':date_of_joining' => !empty($data['date_of_joining']) ? $data['date_of_joining'] : date('Y-m-d'),
        ':status' => !empty($data['status']) ? $data['status'] : 'Active',
        ':id' => $id
    ]);

    if ($result) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Employee updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update employee."]);
    }
    exit();
}

if ($method === 'DELETE') {
    $stmt = $db->prepare("DELETE FROM employees WHERE id = :id");
    $result = $stmt->execute([':id' => $id]);

    if ($result) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Employee deleted successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete employee."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>


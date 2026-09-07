<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';
    $dept_id = isset($_GET['department_id']) && $_GET['department_id'] !== '' ? intval($_GET['department_id']) : null;
    $status = isset($_GET['status']) && $_GET['status'] !== '' ? trim($_GET['status']) : null;
    
    $sort = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'created_at';
    $order = isset($_GET['order']) && strtoupper($_GET['order']) === 'ASC' ? 'ASC' : 'DESC';
    
    $allowed_sorts = ['id', 'first_name', 'last_name', 'email', 'salary', 'date_of_joining', 'created_at', 'department_name'];
    if (!in_array($sort, $allowed_sorts)) {
        $sort = 'created_at';
    }
    
    if ($sort === 'department_name') {
        $sort = 'd.name';
    } else {
        $sort = 'e.' . $sort;
    }

    $query = "SELECT e.*, d.name as department_name, d.code as department_code 
              FROM employees e 
              LEFT JOIN departments d ON e.department_id = d.id 
              WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $query .= " AND (e.first_name LIKE :search OR e.last_name LIKE :search OR e.email LIKE :search OR e.employee_code LIKE :search OR e.designation LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if ($dept_id !== null) {
        $query .= " AND e.department_id = :dept_id";
        $params[':dept_id'] = $dept_id;
    }

    if (!empty($status)) {
        $query .= " AND e.status = :status";
        $params[':status'] = $status;
    }

    $query .= " ORDER BY $sort $order";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->execute();
    $employees = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "count" => count($employees),
        "data" => $employees
    ]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['first_name']) || empty($data['last_name']) || empty($data['email']) || empty($data['department_id']) || empty($data['designation'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "First name, last name, email, department, and designation are required."]);
        exit();
    }

    $check_stmt = $db->prepare("SELECT id FROM employees WHERE email = :email LIMIT 1");
    $check_stmt->execute([':email' => trim($data['email'])]);
    if ($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "An employee with this email already exists."]);
        exit();
    }

    $employee_code = !empty($data['employee_code']) ? trim($data['employee_code']) : 'EMP' . str_pad(mt_rand(100, 999), 3, '0', STR_PAD_LEFT);

    $query = "INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, designation, salary, date_of_joining, status) 
              VALUES (:employee_code, :first_name, :last_name, :email, :phone, :department_id, :designation, :salary, :date_of_joining, :status)";
    
    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':employee_code' => $employee_code,
        ':first_name' => trim($data['first_name']),
        ':last_name' => trim($data['last_name']),
        ':email' => trim($data['email']),
        ':phone' => isset($data['phone']) ? trim($data['phone']) : '',
        ':department_id' => intval($data['department_id']),
        ':designation' => trim($data['designation']),
        ':salary' => isset($data['salary']) ? floatval($data['salary']) : 0.00,
        ':date_of_joining' => !empty($data['date_of_joining']) ? $data['date_of_joining'] : date('Y-m-d'),
        ':status' => !empty($data['status']) ? $data['status'] : 'Active'
    ]);

    if ($result) {
        $id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Employee created successfully.",
            "id" => $id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to create employee."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

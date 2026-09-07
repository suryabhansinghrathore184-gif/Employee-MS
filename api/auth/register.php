<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (empty($data['full_name']) || empty($data['email']) || empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Full name, email, username, and password are required."]);
    exit();
}

$fullName = trim($data['full_name']);
$email = strtolower(trim($data['email']));
$username = strtolower(trim($data['username']));
$rawPassword = trim($data['password']);
$role = !empty($data['role']) ? trim($data['role']) : 'employee';
$department_id = !empty($data['department_id']) ? intval($data['department_id']) : 1;
$designation = !empty($data['designation']) ? trim($data['designation']) : ucfirst($role);

// Check existing user or email
$check = $db->prepare("SELECT id FROM users WHERE LOWER(email) = :email OR LOWER(username) = :username LIMIT 1");
$check->execute([':email' => $email, ':username' => $username]);

if ($check->rowCount() > 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "An account with this email or username already exists."]);
    exit();
}

// Hash password
$hashedPassword = password_hash($rawPassword, PASSWORD_DEFAULT);

try {
    $db->beginTransaction();

    // 1. Insert into users table
    $stmt = $db->prepare("INSERT INTO users (username, password, full_name, email, role) VALUES (:username, :password, :full_name, :email, :role)");
    $stmt->execute([
        ':username' => $username,
        ':password' => $hashedPassword,
        ':full_name' => $fullName,
        ':email' => $email,
        ':role' => $role
    ]);
    $userId = $db->lastInsertId();

    // 2. Generate unique employee code
    $empCode = "EMP" . (100 + $userId);

    // Split name for employee first/last
    $nameParts = explode(' ', $fullName, 2);
    $firstName = $nameParts[0];
    $lastName = isset($nameParts[1]) ? $nameParts[1] : 'User';

    // 3. Insert into employees table
    $empStmt = $db->prepare("INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone, department_id, designation, salary, date_of_joining, work_type, status) VALUES (:user_id, :code, :first, :last, :email, '9876543210', :dept_id, :designation, 55000.00, CURRENT_DATE(), 'Full-time', 'Active')");
    $empStmt->execute([
        ':user_id' => $userId,
        ':code' => $empCode,
        ':first' => $firstName,
        ':last' => $lastName,
        ':email' => $email,
        ':dept_id' => $department_id,
        ':designation' => $designation
    ]);

    $db->commit();

    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Account created successfully! You can now sign in as '$username'.",
        "user" => [
            "id" => $userId,
            "username" => $username,
            "full_name" => $fullName,
            "email" => $email,
            "role" => $role
        ]
    ]);
    exit();
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    exit();
}
?>

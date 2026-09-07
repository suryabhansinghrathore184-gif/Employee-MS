<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $emp_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;
    $date = isset($_GET['date']) ? trim($_GET['date']) : null;
    $status = isset($_GET['status']) ? trim($_GET['status']) : null;

    $query = "SELECT a.*, e.first_name, e.last_name, e.employee_code, d.name as department_name 
              FROM attendance a 
              JOIN employees e ON a.employee_id = e.id 
              LEFT JOIN departments d ON e.department_id = d.id 
              WHERE 1=1";
    $params = [];

    if ($emp_id) {
        $query .= " AND a.employee_id = :emp_id";
        $params[':emp_id'] = $emp_id;
    }
    if ($date) {
        $query .= " AND a.date = :date";
        $params[':date'] = $date;
    }
    if ($status && $status !== 'All') {
        $query .= " AND a.status = :status";
        $params[':status'] = $status;
    }

    $query .= " ORDER BY a.date DESC, a.check_in DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $attendance = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode(["status" => "success", "count" => count($attendance), "data" => $attendance]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = isset($data['action']) ? $data['action'] : '';
    $employee_id = isset($data['employee_id']) ? intval($data['employee_id']) : 1;
    $today = date('Y-m-d');
    $now = date('H:i:s');

    if ($action === 'check_in') {
        // Determine status based on time (Late if after 09:15 AM)
        $status = (date('H:i') > '09:15') ? 'Late' : 'Present';

        // Check existing record today
        $check = $db->prepare("SELECT id FROM attendance WHERE employee_id = :emp_id AND date = :date LIMIT 1");
        $check->execute([':emp_id' => $employee_id, ':date' => $today]);
        $existing = $check->fetch();

        if ($existing) {
            // Update existing record for check in
            $stmt = $db->prepare("UPDATE attendance SET check_in = :check_in, check_out = NULL, working_hours = 0.00, status = :status WHERE id = :id");
            $stmt->execute([':check_in' => $now, ':status' => $status, ':id' => $existing['id']]);
            $msg = "Checked in successfully at " . date('h:i A') . ($status === 'Late' ? ' (Marked Late)' : '');
        } else {
            $stmt = $db->prepare("INSERT INTO attendance (employee_id, date, check_in, status) VALUES (:emp_id, :date, :check_in, :status)");
            $stmt->execute([':emp_id' => $employee_id, ':date' => $today, ':check_in' => $now, ':status' => $status]);
            $msg = "Checked in successfully at " . date('h:i A') . ($status === 'Late' ? ' (Marked Late)' : '');
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => $msg]);
        exit();
    }

    if ($action === 'check_out') {
        $check = $db->prepare("SELECT id, check_in FROM attendance WHERE employee_id = :emp_id AND date = :date LIMIT 1");
        $check->execute([':emp_id' => $employee_id, ':date' => $today]);
        $record = $check->fetch();

        if (!$record) {
            // If no check-in record, create one with standard start 09:00 AM
            $default_in = '09:00:00';
            $stmt = $db->prepare("INSERT INTO attendance (employee_id, date, check_in, check_out, working_hours, status) VALUES (:emp_id, :date, :check_in, :check_out, 8.00, 'Present')");
            $stmt->execute([':emp_id' => $employee_id, ':date' => $today, ':check_in' => $default_in, ':check_out' => $now]);
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Checked out successfully at " . date('h:i A')]);
            exit();
        }

        // Calculate working hours
        $check_in_time = strtotime($record['check_in'] ?: '09:00:00');
        $check_out_time = strtotime($now);
        $diff_hours = round(($check_out_time - $check_in_time) / 3600, 2);
        if ($diff_hours < 0) $diff_hours = 8.00;

        $stmt = $db->prepare("UPDATE attendance SET check_out = :check_out, working_hours = :hours WHERE id = :id");
        $stmt->execute([':check_out' => $now, ':hours' => $diff_hours, ':id' => $record['id']]);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Checked out successfully at " . date('h:i A')]);
        exit();
    }

    if ($action === 'mark_absent' || $action === 'record_attendance') {
        $rec_date = !empty($data['date']) ? trim($data['date']) : $today;
        $rec_status = !empty($data['status']) ? trim($data['status']) : 'Absent';
        $rec_notes = !empty($data['notes']) ? trim($data['notes']) : "Recorded as $rec_status";
        $emp_target = intval($data['employee_id']);

        // Check if attendance record exists for target date
        $check = $db->prepare("SELECT id FROM attendance WHERE employee_id = :emp_id AND date = :date LIMIT 1");
        $check->execute([':emp_id' => $emp_target, ':date' => $rec_date]);
        $existing = $check->fetch();

        if ($existing) {
            $stmt = $db->prepare("UPDATE attendance SET status = :status, notes = :notes WHERE id = :id");
            $stmt->execute([':status' => $rec_status, ':notes' => $rec_notes, ':id' => $existing['id']]);
            $msg = "Attendance updated to '$rec_status' for selected employee.";
        } else {
            $stmt = $db->prepare("INSERT INTO attendance (employee_id, date, status, notes, working_hours) VALUES (:emp_id, :date, :status, :notes, 0.00)");
            $stmt->execute([':emp_id' => $emp_target, ':date' => $rec_date, ':status' => $rec_status, ':notes' => $rec_notes]);
            $msg = "Employee recorded as '$rec_status' on $rec_date.";
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => $msg]);
        exit();
    }
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

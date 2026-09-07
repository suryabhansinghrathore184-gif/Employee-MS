<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $emp_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;
    $month_year = isset($_GET['month_year']) ? trim($_GET['month_year']) : '2026-09';
    $status = isset($_GET['status']) ? trim($_GET['status']) : null;

    $query = "SELECT p.*, e.first_name, e.last_name, e.employee_code, e.email, e.designation, d.name as department_name 
              FROM payroll p 
              JOIN employees e ON p.employee_id = e.id 
              LEFT JOIN departments d ON e.department_id = d.id 
              WHERE 1=1";
    $params = [];

    if ($emp_id) {
        $query .= " AND p.employee_id = :emp_id";
        $params[':emp_id'] = $emp_id;
    }
    if ($month_year && $month_year !== 'All') {
        $query .= " AND p.month_year = :month_year";
        $params[':month_year'] = $month_year;
    }
    if ($status && $status !== 'All') {
        $query .= " AND p.status = :status";
        $params[':status'] = $status;
    }

    $query .= " ORDER BY e.first_name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $records = $stmt->fetchAll();

    // Calculate totals
    $total_payout = 0;
    $paid_count = 0;
    $pending_count = 0;

    foreach ($records as $r) {
        $total_payout += floatval($r['net_salary']);
        if ($r['status'] === 'Paid') $paid_count++;
        if ($r['status'] === 'Pending') $pending_count++;
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "count" => count($records),
        "summary" => [
            "total_payout" => $total_payout,
            "paid_count" => $paid_count,
            "pending_count" => $pending_count,
        ],
        "data" => $records
    ]);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = isset($data['action']) ? $data['action'] : '';

    if ($action === 'generate_all') {
        $month = isset($data['month_year']) ? trim($data['month_year']) : date('Y-m');

        // Fetch all active employees
        $empStmt = $db->query("SELECT id, salary FROM employees WHERE status = 'Active'");
        $employees = $empStmt->fetchAll();

        $inserted = 0;
        foreach ($employees as $emp) {
            $empId = $emp['id'];
            $baseSalary = floatval($emp['salary']);
            $hra = round($baseSalary * 0.40, 2);
            $allowances = round($baseSalary * 0.20, 2);
            $bonus = 0.00;
            $tax = round($baseSalary * 0.10, 2);
            $pf = round($baseSalary * 0.05, 2);
            $net = $baseSalary + $hra + $allowances + $bonus - ($tax + $pf);

            $check = $db->prepare("SELECT id FROM payroll WHERE employee_id = :emp_id AND month_year = :month LIMIT 1");
            $check->execute([':emp_id' => $empId, ':month' => $month]);

            if ($check->rowCount() === 0) {
                $stmt = $db->prepare("INSERT INTO payroll (employee_id, month_year, basic_salary, hra, allowances, bonuses, tax_deduction, pf_deduction, net_salary, status, payment_method) VALUES (:emp_id, :month, :basic, :hra, :allow, :bonus, :tax, :pf, :net, 'Pending', 'Direct Bank Transfer')");
                $stmt->execute([
                    ':emp_id' => $empId,
                    ':month' => $month,
                    ':basic' => $baseSalary,
                    ':hra' => $hra,
                    ':allow' => $allowances,
                    ':bonus' => $bonus,
                    ':tax' => $tax,
                    ':pf' => $pf,
                    ':net' => $net
                ]);
                $inserted++;
            }
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Generated payroll for $inserted employees for month $month."]);
        exit();
    }

    if ($action === 'mark_paid') {
        $id = intval($data['id']);
        $today = date('Y-m-d');

        $stmt = $db->prepare("UPDATE payroll SET status = 'Paid', payment_date = :today WHERE id = :id");
        $stmt->execute([':today' => $today, ':id' => $id]);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Payslip status updated to Paid."]);
        exit();
    }
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed."]);
?>

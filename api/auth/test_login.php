<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$data = json_encode(['username' => 'admin', 'password' => 'admin123']);
// Mock php://input
file_put_contents('php://input', $data);

require_once __DIR__ . '/login.php';
?>

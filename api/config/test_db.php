<?php
require_once __DIR__ . '/database.php';
$database = new Database();
$db = $database->getConnection();
if ($db) {
    echo "SUCCESS: Database connected successfully!";
} else {
    echo "FAILED: Could not connect.";
}
?>

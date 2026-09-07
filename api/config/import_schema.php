<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = file_get_contents(__DIR__ . '/../../database/schema.sql');
    $pdo->exec($sql);
    echo "SUCCESS: Database schema imported successfully via PDO on port 3307!";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
?>

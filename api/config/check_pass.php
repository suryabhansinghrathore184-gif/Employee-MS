<?php
$passwords = ['', 'root', 'admin', 'password', '123456', 'root123', 'admin123', 'mysql'];
foreach ($passwords as $pass) {
    try {
        $pdo = new PDO("mysql:host=127.0.0.1;port=3306", "root", $pass);
        echo "MATCH FOUND! Password is: '$pass'\n";
        exit;
    } catch (PDOException $e) {
        // continue
    }
}
echo "NO MATCH FOUND in common list.";
?>

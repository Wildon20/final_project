<?php
// Test database connection for DR T DENTAL
$host = "localhost";
$dbname = "drt_dental_smart";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>✅ Database Connection Successful!</h2>";
    echo "<p>Connected to: <strong>$dbname</strong></p>";
    
    // Test query to count tables
    $stmt = $pdo->query("SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '$dbname'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Number of tables created: <strong>" . $result['table_count'] . "</strong></p>";
    
    // Test query to show sample data
    $stmt = $pdo->query("SELECT COUNT(*) as doctor_count FROM doctors");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Number of doctors: <strong>" . $result['doctor_count'] . "</strong></p>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as service_count FROM services");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Number of services: <strong>" . $result['service_count'] . "</strong></p>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as patient_count FROM patients");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Number of patients: <strong>" . $result['patient_count'] . "</strong></p>";
    
    echo "<h3>🎉 Database Setup Complete!</h3>";
    echo "<p>Your DR T DENTAL database is ready to use.</p>";
    
} catch(PDOException $e) {
    echo "<h2>❌ Database Connection Failed</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>Please check your XAMPP MySQL service is running.</p>";
}
?>

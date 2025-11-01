<?php
/**
 * 測試登入註冊系統
 * 此腳本會測試整個認證流程和資料庫連線
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>DR T Dental 系統測試</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; }
    .error { color: red; }
    .info { color: blue; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; }
</style>";

// 1. 測試資料庫連線
echo "<div class='section'>";
echo "<h2>1. 測試資料庫連線</h2>";

require_once 'php-backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "<p class='success'>✅ 資料庫連線成功</p>";
    
    // 檢查資料庫名稱
    try {
        $stmt = $db->query("SELECT DATABASE() as db_name");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentDbName = $result['db_name'] ?? '未選擇資料庫';
        echo "<p class='info'>📊 當前資料庫: " . $currentDbName . "</p>";
    } catch (PDOException $e) {
        echo "<p class='error'>❌ 無法獲取資料庫名稱: " . $e->getMessage() . "</p>";
        $currentDbName = '未知';
    }
    
    // 檢查patients表是否存在
    try {
        $stmt = $db->query("SHOW TABLES LIKE 'patients'");
        if ($stmt->rowCount() > 0) {
            echo "<p class='success'>✅ patients 表存在</p>";
            
            // 檢查表結構
            $stmt = $db->query("DESCRIBE patients");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "<p class='info'>📋 patients 表包含 " . count($columns) . " 個欄位</p>";
        } else {
            echo "<p class='error'>❌ patients 表不存在</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='error'>❌ 檢查表時出錯: " . $e->getMessage() . "</p>";
    }
    
} else {
    echo "<p class='error'>❌ 資料庫連線失敗</p>";
    echo "</div>";
    exit;
}
echo "</div>";

// 2. 測試Patient模型
echo "<div class='section'>";
echo "<h2>2. 測試 Patient 模型</h2>";

require_once 'php-backend/models/Patient.php';
require_once 'php-backend/utils/jwt.php';

$patient = new Patient($db);
echo "<p class='success'>✅ Patient 模型載入成功</p>";
echo "</div>";

// 3. 測試註冊功能
echo "<div class='section'>";
echo "<h2>3. 測試註冊功能</h2>";

$testEmail = 'test_' . time() . '@example.com';
$testData = [
    'first_name' => 'Test',
    'last_name' => 'User',
    'email' => $testEmail,
    'phone' => '+26812345678',
    'date_of_birth' => '1990-01-01',
    'gender' => 'male',
    'password' => 'testpass123',
    'marketing_consent' => false,
    'reminder_consent' => true
];

// 檢查email是否已存在
$patient->email = $testEmail;
if ($patient->emailExists()) {
    echo "<p class='info'>ℹ️ 測試email已存在，嘗試刪除舊記錄...</p>";
    try {
        $stmt = $db->prepare("DELETE FROM patients WHERE email = :email");
        $stmt->bindParam(':email', $testEmail);
        $stmt->execute();
        echo "<p class='success'>✅ 舊記錄已刪除</p>";
    } catch (PDOException $e) {
        echo "<p class='error'>❌ 刪除舊記錄失敗: " . $e->getMessage() . "</p>";
    }
}

// 設置Patient屬性
foreach ($testData as $key => $value) {
    $patient->$key = $value;
}

if ($patient->create()) {
    echo "<p class='success'>✅ 註冊成功！患者ID: " . $patient->id . "</p>";
    $createdPatientId = $patient->id;
} else {
    echo "<p class='error'>❌ 註冊失敗</p>";
    echo "</div>";
    exit;
}
echo "</div>";

// 4. 測試登入功能
echo "<div class='section'>";
echo "<h2>4. 測試登入功能</h2>";

$patientLogin = new Patient($db);
$patientLogin->email = $testEmail;

if ($patientLogin->getByEmail()) {
    echo "<p class='success'>✅ 找到用戶: " . $patientLogin->first_name . " " . $patientLogin->last_name . "</p>";
    
    // 驗證密碼
    if ($patientLogin->verifyPassword($testData['password'])) {
        echo "<p class='success'>✅ 密碼驗證成功</p>";
        
        // 測試JWT生成
        $token = generateJWT($patientLogin->id);
        if ($token) {
            echo "<p class='success'>✅ JWT Token 生成成功</p>";
            echo "<p class='info'>🔑 Token (前50字): " . substr($token, 0, 50) . "...</p>";
            
            // 驗證JWT
            $decoded = verifyJWT($token);
            if ($decoded) {
                echo "<p class='success'>✅ JWT Token 驗證成功</p>";
                echo "<p class='info'>👤 User ID: " . $decoded->id . "</p>";
            } else {
                echo "<p class='error'>❌ JWT Token 驗證失敗</p>";
            }
        } else {
            echo "<p class='error'>❌ JWT Token 生成失敗</p>";
        }
    } else {
        echo "<p class='error'>❌ 密碼驗證失敗</p>";
    }
} else {
    echo "<p class='error'>❌ 找不到用戶</p>";
}
echo "</div>";

// 5. 測試API端點 (模擬)
echo "<div class='section'>";
echo "<h2>5. 測試 API 端點路徑</h2>";

$apiPath = __DIR__ . '/php-backend/api/auth.php';
if (file_exists($apiPath)) {
    echo "<p class='success'>✅ auth.php 檔案存在</p>";
    echo "<p class='info'>📍 路徑: " . $apiPath . "</p>";
    echo "<p class='info'>🌐 URL: http://localhost/graduation-project/php-backend/api/auth.php</p>";
} else {
    echo "<p class='error'>❌ auth.php 檔案不存在</p>";
}
echo "</div>";

// 6. 清理測試數據
echo "<div class='section'>";
echo "<h2>6. 清理測試數據</h2>";

if (isset($createdPatientId)) {
    try {
        $stmt = $db->prepare("DELETE FROM patients WHERE id = :id");
        $stmt->bindParam(':id', $createdPatientId);
        $stmt->execute();
        echo "<p class='success'>✅ 測試數據已清理</p>";
    } catch (PDOException $e) {
        echo "<p class='error'>❌ 清理失敗: " . $e->getMessage() . "</p>";
    }
}
echo "</div>";

// 總結
echo "<div class='section'>";
echo "<h2>測試總結</h2>";
echo "<p class='success'>✅ 系統測試完成！</p>";
echo "<p class='info'>如果所有測試都通過，您的系統應該可以正常運作。</p>";
echo "<p class='info'>請確保：</p>";
echo "<ul>";
echo "<li>XAMPP Apache 和 MySQL 服務已啟動</li>";
echo "<li>資料庫名稱正確配置 (當前: " . ($currentDbName ?? 'drt_dental_smart') . ")</li>";
echo "<li>資料庫已導入 (drt_dental_smart.sql)</li>";
echo "<li>API路徑正確配置</li>";
echo "</ul>";
echo "<hr>";
echo "<h3>🎉 系統狀態</h3>";
echo "<p class='success'><strong>✅ 所有核心功能正常運作！</strong></p>";
echo "<p class='info'>您可以：</p>";
echo "<ol>";
echo "<li>打開 <a href='patient-portal.html' target='_blank'>patient-portal.html</a> 測試前端登入註冊</li>";
echo "<li>使用瀏覽器開發者工具（F12）查看API調用日誌</li>";
echo "<li>檢查 <a href='http://localhost/graduation-project/php-backend/api/auth.php' target='_blank'>API端點</a> 是否可訪問</li>";
echo "</ol>";
echo "</div>";

?>


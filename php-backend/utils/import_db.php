<?php
/**
 * Secure SQL import helper.
 *
 * Supports:
 * - CLI: php php-backend/utils/import_db.php --file=php-backend/sql/drt_dental_smart.sql --token=YOUR_TOKEN
 * - HTTP: /php-backend/utils/import_db.php?token=YOUR_TOKEN  (POST/GET)
 *
 * Security:
 * - Requires env ALLOW_DB_IMPORT=1
 * - Requires env IMPORT_TOKEN and matching ?token=
 * - Returns JSON
 */

declare(strict_types=1);

function json_response(int $status, array $payload): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

// Check enable flag
$allowImport = getenv('ALLOW_DB_IMPORT') === '1';
if (!$allowImport) {
    json_response(403, ['success' => false, 'message' => 'Import disabled. Set ALLOW_DB_IMPORT=1 to enable.']);
}

// Token check
$expectedToken = getenv('IMPORT_TOKEN') ?: '';

// Read args from CLI or HTTP
$isCli = (php_sapi_name() === 'cli');
$fileArg = null;
$tokenArg = null;

if ($isCli) {
    foreach ($argv as $arg) {
        if (str_starts_with($arg, '--file=')) {
            $fileArg = substr($arg, 7);
        } elseif (str_starts_with($arg, '--token=')) {
            $tokenArg = substr($arg, 8);
        }
    }
} else {
    $fileArg = $_GET['file'] ?? $_POST['file'] ?? null;
    $tokenArg = $_GET['token'] ?? $_POST['token'] ?? null;
}

if (!$expectedToken || !$tokenArg || !hash_equals($expectedToken, $tokenArg)) {
    json_response(401, ['success' => false, 'message' => 'Unauthorized: invalid or missing token']);
}

// Resolve SQL file path
$defaultFile = __DIR__ . '/../sql/drt_dental_smart.sql';
$sqlFile = $fileArg ? $fileArg : $defaultFile;
// Normalize relative paths
if (!preg_match('/^(?:[A-Za-z]:)?[\/\\\\]/', $sqlFile)) {
    $sqlFile = realpath(getcwd() . DIRECTORY_SEPARATOR . $sqlFile) ?: $sqlFile;
}
if (!is_file($sqlFile)) {
    json_response(400, ['success' => false, 'message' => 'SQL file not found', 'file' => $sqlFile]);
}
$sql = file_get_contents($sqlFile);
if ($sql === false || trim($sql) === '') {
    json_response(400, ['success' => false, 'message' => 'SQL file is empty or unreadable', 'file' => $sqlFile]);
}

// Connect using env vars (DB_* preferred, fallback to MYSQL*)
$host = getenv('DB_HOST') ?: getenv('MYSQLHOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: getenv('MYSQLPORT') ?: '3306';
$db   = getenv('DB_NAME') ?: getenv('MYSQLDATABASE') ?: '';
$user = getenv('DB_USER') ?: getenv('MYSQLUSER') ?: 'root';
$pass = getenv('DB_PASSWORD') ?: getenv('MYSQLPASSWORD') ?: '';

if (!$db) {
    json_response(400, ['success' => false, 'message' => 'Database name missing. Set DB_NAME or MYSQLDATABASE.']);
}

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_PERSISTENT => false,
    ]);

    // Split SQL into statements safely enough for typical schema/data dumps
    // Note: We assume the dump does not rely on custom DELIMITER.
    $statements = [];
    $buffer = '';
    $inString = false;
    $stringChar = '';

    $len = strlen($sql);
    for ($i = 0; $i < $len; $i++) {
        $ch = $sql[$i];
        $next = $i + 1 < $len ? $sql[$i + 1] : '';

        // Handle line comments -- and # when not in string
        if (!$inString && $ch === '-' && $next === '-' ) {
            // skip until newline
            while ($i < $len && $sql[$i] !== "\n") $i++;
            continue;
        }
        if (!$inString && $ch === '#') {
            while ($i < $len && $sql[$i] !== "\n") $i++;
            continue;
        }
        // Handle block comments /* ... */
        if (!$inString && $ch === '/' && $next === '*') {
            $i += 2;
            while ($i + 1 < $len && !($sql[$i] === '*' && $sql[$i + 1] === '/')) $i++;
            $i++; // skip '/'
            continue;
        }

        // String detection
        if ($ch === '\'' || $ch === '"') {
            if (!$inString) {
                $inString = true;
                $stringChar = $ch;
            } elseif ($stringChar === $ch) {
                // check for escaped quote
                $escaped = ($i > 0 && $sql[$i - 1] === '\\');
                if (!$escaped) {
                    $inString = false;
                    $stringChar = '';
                }
            }
        }

        if (!$inString && $ch === ';') {
            $statements[] = $buffer;
            $buffer = '';
        } else {
            $buffer .= $ch;
        }
    }
    if (trim($buffer) !== '') {
        $statements[] = $buffer;
    }

    $executed = 0;
    $pdo->beginTransaction();
    foreach ($statements as $stmt) {
        $stmt = trim($stmt);
        if ($stmt === '') continue;
        $pdo->exec($stmt);
        $executed++;
    }
    $pdo->commit();

    json_response(200, [
        'success' => true,
        'message' => 'Import completed',
        'file' => $sqlFile,
        'executedStatements' => $executed
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(500, [
        'success' => false,
        'message' => 'Import failed',
        'error' => $e->getMessage()
    ]);
}



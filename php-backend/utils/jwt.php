<?php
// JWT Secret Key (in production, use environment variable)
define('JWT_SECRET', 'your-super-secret-jwt-key-here');
define('JWT_ALGORITHM', 'HS256');

// Generate JWT token
function generateJWT($user_id) {
    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
    
    $payload = json_encode([
        'id' => $user_id,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ]);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

// Verify JWT token
function verifyJWT($token) {
    $tokenParts = explode('.', $token);
    
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    $signatureProvided = $tokenParts[2];
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if ($base64Signature !== $signatureProvided) {
        return false;
    }
    
    $payloadData = json_decode($payload);
    
    if ($payloadData->exp < time()) {
        return false;
    }
    
    return $payloadData;
}

// Get current user ID from JWT token
function getCurrentUserId() {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? '';
    
    if (empty($auth_header) || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    $decoded = verifyJWT($token);
    
    return $decoded ? $decoded->id : null;
}
?>


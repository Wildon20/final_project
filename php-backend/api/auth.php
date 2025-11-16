<?php
// Suppress warnings for better JSON output
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Ensure unexpected errors also return JSON (avoid empty 200 responses)
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal Server Error',
        'error' => $e->getMessage()
    ]);
    exit();
});
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server Error',
            'error' => $error['message']
        ]);
    }
});

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/Patient.php';
require_once '../utils/jwt.php';

$database = new Database();
$db = $database->getConnection();
$patient = new Patient($db);

$method = $_SERVER['REQUEST_METHOD'];

// Handle both PATH_INFO and query parameter routing
$action = '';
// Check if PATH_INFO exists and is not empty
if (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
    $request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    $action = $request[0] ?? '';
} elseif (isset($_GET['action'])) {
    $action = $_GET['action'];
}

// Get request data
$data = json_decode(file_get_contents("php://input"));

// Debug logging (comment out in production)
// error_log("API Debug - Method: $method, Action: $action, Data: " . json_encode($data));

// Response helper function
function sendResponse($success, $message, $data = null, $http_code = 200) {
    http_response_code($http_code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Validation helper function
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validatePassword($password) {
    return strlen($password) >= 6;
}

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'register':
                // Validate required fields
                if (empty($data->first_name) || empty($data->last_name) || 
                    empty($data->email) || empty($data->phone) || 
                    empty($data->date_of_birth) || empty($data->gender) || 
                    empty($data->password)) {
                    sendResponse(false, 'All required fields must be filled', null, 400);
                }

                // Validate email format
                if (!validateEmail($data->email)) {
                    sendResponse(false, 'Invalid email format', null, 400);
                }

                // Validate password strength
                if (!validatePassword($data->password)) {
                    sendResponse(false, 'Password must be at least 6 characters long', null, 400);
                }

                // Check if email already exists
                $patient->email = $data->email;
                if ($patient->emailExists()) {
                    sendResponse(false, 'Email already exists', null, 400);
                }

                // Set patient data
                $patient->first_name = $data->first_name;
                $patient->last_name = $data->last_name;
                $patient->email = $data->email;
                $patient->phone = $data->phone;
                $patient->date_of_birth = $data->date_of_birth;
                $patient->gender = $data->gender;
                $patient->password = $data->password;
                $patient->street_address = $data->street_address ?? '';
                $patient->city = $data->city ?? '';
                $patient->postal_code = $data->postal_code ?? '';
                $patient->country = $data->country ?? 'Eswatini';
                $patient->emergency_contact_name = $data->emergency_contact_name ?? '';
                $patient->emergency_contact_relationship = $data->emergency_contact_relationship ?? '';
                $patient->emergency_contact_phone = $data->emergency_contact_phone ?? '';
                $patient->insurance_provider = $data->insurance_provider ?? '';
                $patient->insurance_member_id = $data->insurance_member_id ?? '';
                $patient->insurance_group_number = $data->insurance_group_number ?? '';
                $patient->insurance_active = $data->insurance_active ?? false;
                $patient->allergies = $data->allergies ?? '';
                $patient->medications = $data->medications ?? '';
                $patient->medical_conditions = $data->medical_conditions ?? '';
                $patient->previous_dental_work = $data->previous_dental_work ?? '';
                $patient->preferred_contact_method = $data->preferred_contact_method ?? 'email';
                $patient->marketing_consent = $data->marketing_consent ?? false;
                $patient->reminder_consent = $data->reminder_consent ?? true;

                // Create patient
                if ($patient->create()) {
                    // Generate JWT token
                    $token = generateJWT($patient->id);
                    
                    // Get patient data without password
                    $patient->getById();
                    unset($patient->password);
                    
                    sendResponse(true, 'Patient registered successfully', [
                        'patient' => $patient,
                        'token' => $token
                    ], 201);
                } else {
                    sendResponse(false, 'Registration failed', null, 500);
                }
                break;

            case 'login':
                // Validate required fields
                if (empty($data->email) || empty($data->password)) {
                    sendResponse(false, 'Email and password are required', null, 400);
                }

                // Validate email format
                if (!validateEmail($data->email)) {
                    sendResponse(false, 'Invalid email format', null, 400);
                }

                // Get patient by email
                $patient->email = $data->email;
                if (!$patient->getByEmail()) {
                    sendResponse(false, 'Invalid credentials', null, 401);
                }

                // Check if account is active
                if (!$patient->is_active) {
                    sendResponse(false, 'Account is deactivated', null, 401);
                }

                // Verify password
                if (!$patient->verifyPassword($data->password)) {
                    sendResponse(false, 'Invalid credentials', null, 401);
                }

                // Update last login
                $patient->updateLastLogin();

                // Generate JWT token
                $token = generateJWT($patient->id);

                // Get patient data without password
                unset($patient->password);

                sendResponse(true, 'Login successful', [
                    'patient' => $patient,
                    'token' => $token
                ]);
                break;

            case 'forgot-password':
                if (empty($data->email)) {
                    sendResponse(false, 'Email is required', null, 400);
                }

                if (!validateEmail($data->email)) {
                    sendResponse(false, 'Invalid email format', null, 400);
                }

                $patient->email = $data->email;
                if (!$patient->getByEmail()) {
                    sendResponse(false, 'No patient found with this email', null, 404);
                }

                // Generate reset token (in real app, send email)
                $reset_token = bin2hex(random_bytes(32));
                
                // Update reset token in database
                $query = "UPDATE patients SET reset_password_token = :token, reset_password_expire = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':token', $reset_token);
                $stmt->bindParam(':id', $patient->id);
                $stmt->execute();

                sendResponse(true, 'Password reset token sent to email', ['reset_token' => $reset_token]);
                break;

            case 'reset-password':
                if (empty($data->token) || empty($data->new_password)) {
                    sendResponse(false, 'Token and new password are required', null, 400);
                }

                if (!validatePassword($data->new_password)) {
                    sendResponse(false, 'Password must be at least 6 characters long', null, 400);
                }

                // Find patient with valid reset token
                $query = "SELECT id FROM patients WHERE reset_password_token = :token AND reset_password_expire > NOW()";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':token', $data->token);
                $stmt->execute();

                if ($stmt->rowCount() == 0) {
                    sendResponse(false, 'Invalid or expired reset token', null, 400);
                }

                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $patient->id = $row['id'];

                // Update password
                if ($patient->changePassword($data->new_password)) {
                    // Clear reset token
                    $query = "UPDATE patients SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = :id";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':id', $patient->id);
                    $stmt->execute();

                    sendResponse(true, 'Password reset successfully');
                } else {
                    sendResponse(false, 'Password reset failed', null, 500);
                }
                break;

            default:
                sendResponse(false, 'Invalid action', null, 404);
        }
        break;

    case 'GET':
        // Verify JWT token
        $headers = getallheaders();
        $auth_header = $headers['Authorization'] ?? '';
        
        if (empty($auth_header) || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            sendResponse(false, 'Access denied. No token provided.', null, 401);
        }

        $token = $matches[1];
        $decoded = verifyJWT($token);
        
        if (!$decoded) {
            sendResponse(false, 'Invalid token', null, 401);
        }

        switch ($action) {
            case 'me':
                $patient->id = $decoded->id;
                if ($patient->getById()) {
                    unset($patient->password);
                    sendResponse(true, 'Patient data retrieved', $patient);
                } else {
                    sendResponse(false, 'Patient not found', null, 404);
                }
                break;

            default:
                sendResponse(false, 'Invalid action', null, 404);
        }
        break;

    case 'PUT':
        // Verify JWT token
        $headers = getallheaders();
        $auth_header = $headers['Authorization'] ?? '';
        
        if (empty($auth_header) || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            sendResponse(false, 'Access denied. No token provided.', null, 401);
        }

        $token = $matches[1];
        $decoded = verifyJWT($token);
        
        if (!$decoded) {
            sendResponse(false, 'Invalid token', null, 401);
        }

        switch ($action) {
            case 'profile':
                $patient->id = $decoded->id;
                $patient->getById();

                // Update fields if provided
                if (isset($data->first_name)) $patient->first_name = $data->first_name;
                if (isset($data->last_name)) $patient->last_name = $data->last_name;
                if (isset($data->phone)) $patient->phone = $data->phone;
                if (isset($data->street_address)) $patient->street_address = $data->street_address;
                if (isset($data->city)) $patient->city = $data->city;
                if (isset($data->postal_code)) $patient->postal_code = $data->postal_code;
                if (isset($data->country)) $patient->country = $data->country;
                if (isset($data->emergency_contact_name)) $patient->emergency_contact_name = $data->emergency_contact_name;
                if (isset($data->emergency_contact_relationship)) $patient->emergency_contact_relationship = $data->emergency_contact_relationship;
                if (isset($data->emergency_contact_phone)) $patient->emergency_contact_phone = $data->emergency_contact_phone;
                if (isset($data->insurance_provider)) $patient->insurance_provider = $data->insurance_provider;
                if (isset($data->insurance_member_id)) $patient->insurance_member_id = $data->insurance_member_id;
                if (isset($data->insurance_group_number)) $patient->insurance_group_number = $data->insurance_group_number;
                if (isset($data->insurance_active)) $patient->insurance_active = $data->insurance_active;
                if (isset($data->allergies)) $patient->allergies = $data->allergies;
                if (isset($data->medications)) $patient->medications = $data->medications;
                if (isset($data->medical_conditions)) $patient->medical_conditions = $data->medical_conditions;
                if (isset($data->previous_dental_work)) $patient->previous_dental_work = $data->previous_dental_work;
                if (isset($data->preferred_contact_method)) $patient->preferred_contact_method = $data->preferred_contact_method;
                if (isset($data->marketing_consent)) $patient->marketing_consent = $data->marketing_consent;
                if (isset($data->reminder_consent)) $patient->reminder_consent = $data->reminder_consent;

                if ($patient->updateProfile()) {
                    unset($patient->password);
                    sendResponse(true, 'Profile updated successfully', $patient);
                } else {
                    sendResponse(false, 'Profile update failed', null, 500);
                }
                break;

            case 'change-password':
                if (empty($data->current_password) || empty($data->new_password)) {
                    sendResponse(false, 'Current password and new password are required', null, 400);
                }

                if (!validatePassword($data->new_password)) {
                    sendResponse(false, 'New password must be at least 6 characters long', null, 400);
                }

                $patient->id = $decoded->id;
                $patient->getById();

                if (!$patient->verifyPassword($data->current_password)) {
                    sendResponse(false, 'Current password is incorrect', null, 400);
                }

                if ($patient->changePassword($data->new_password)) {
                    sendResponse(true, 'Password changed successfully');
                } else {
                    sendResponse(false, 'Password change failed', null, 500);
                }
                break;

            default:
                sendResponse(false, 'Invalid action', null, 404);
        }
        break;

    default:
        sendResponse(false, 'Method not allowed', null, 405);
}
?>


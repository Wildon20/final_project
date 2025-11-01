<?php
// Suppress warnings for better JSON output
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../utils/jwt.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Handle both PATH_INFO and query parameter routing
$action = '';
if (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
    $request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    $action = $request[0] ?? '';
} elseif (isset($_GET['action'])) {
    $action = $_GET['action'];
}

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

// Verify JWT token
function verifyToken() {
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
    
    return $decoded->id;
}

switch ($method) {
    case 'GET':
        // Get patient medical records (protected endpoint)
        // Can use either token verification or patient_id from query
        $patient_id = null;
        
        // Try to get patient_id from query parameter
        if (isset($_GET['patient_id'])) {
            $patient_id = intval($_GET['patient_id']);
            
            // Verify token to ensure user can only access their own records
            $token_user_id = verifyToken();
            if ($token_user_id != $patient_id) {
                sendResponse(false, 'Access denied. You can only view your own records.', null, 403);
            }
        } else {
            // If no patient_id, use token to get user ID
            $patient_id = verifyToken();
        }
        
        $record_type = $_GET['record_type'] ?? '';
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT mr.*, 
                         d.first_name as doctor_first_name, 
                         d.last_name as doctor_last_name,
                         d.title as doctor_title,
                         d.specialization as doctor_specialization,
                         a.appointment_date,
                         a.appointment_time
                  FROM medical_records mr
                  INNER JOIN doctors d ON mr.doctor_id = d.id
                  LEFT JOIN appointments a ON mr.appointment_id = a.id
                  WHERE mr.patient_id = :patient_id";
        
        if (!empty($record_type)) {
            $query .= " AND mr.record_type = :record_type";
        }
        
        $query .= " ORDER BY mr.treatment_date DESC, mr.created_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':patient_id', $patient_id, PDO::PARAM_INT);
        if (!empty($record_type)) {
            $stmt->bindParam(':record_type', $record_type);
        }
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format records for frontend
        $formatted_records = array_map(function($record) {
            return [
                'id' => $record['id'],
                'record_type' => $record['record_type'],
                'treatment' => $record['treatment'],
                'primary_diagnosis' => $record['primary_diagnosis'],
                'secondary_diagnosis' => $record['secondary_diagnosis'],
                'treatment_date' => $record['treatment_date'],
                'doctor_name' => trim($record['doctor_title'] . ' ' . $record['doctor_first_name'] . ' ' . $record['doctor_last_name']),
                'doctor_specialization' => $record['doctor_specialization'],
                'clinical_findings' => $record['clinical_findings'],
                'treatment_provided' => $record['treatment_provided'],
                'recommendations' => $record['recommendations'],
                'follow_up_instructions' => $record['follow_up_instructions'],
                'status' => $record['status'],
                'appointment_date' => $record['appointment_date'],
                'appointment_time' => $record['appointment_time'],
                'created_at' => $record['created_at']
            ];
        }, $records);
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM medical_records WHERE patient_id = :patient_id";
        if (!empty($record_type)) {
            $count_query .= " AND record_type = :record_type";
        }
        $stmt = $db->prepare($count_query);
        $stmt->bindParam(':patient_id', $patient_id, PDO::PARAM_INT);
        if (!empty($record_type)) {
            $stmt->bindParam(':record_type', $record_type);
        }
        $stmt->execute();
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        sendResponse(true, 'Medical records retrieved', [
            'records' => $formatted_records,
            'pagination' => [
                'current' => $page,
                'pages' => ceil($total / $limit),
                'total' => $total
            ]
        ]);
        break;

    case 'POST':
        // Create medical record (protected endpoint - admin/doctor only)
        // For now, we'll just verify token
        $user_id = verifyToken();
        
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (empty($data->patient_id) || empty($data->doctor_id) || 
            empty($data->record_type) || empty($data->treatment) || 
            empty($data->primary_diagnosis) || empty($data->treatment_date)) {
            sendResponse(false, 'Required fields are missing', null, 400);
        }
        
        // Create medical record
        $query = "INSERT INTO medical_records 
                  (patient_id, doctor_id, appointment_id, record_type, treatment, 
                   primary_diagnosis, secondary_diagnosis, diagnosis_notes, 
                   chief_complaint, history_of_present_illness, clinical_findings, 
                   treatment_provided, recommendations, follow_up_instructions,
                   treatment_date, status) 
                  VALUES (:patient_id, :doctor_id, :appointment_id, :record_type, :treatment, 
                          :primary_diagnosis, :secondary_diagnosis, :diagnosis_notes,
                          :chief_complaint, :history_of_present_illness, :clinical_findings,
                          :treatment_provided, :recommendations, :follow_up_instructions,
                          :treatment_date, :status)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':patient_id', $data->patient_id);
        $stmt->bindParam(':doctor_id', $data->doctor_id);
        $stmt->bindParam(':appointment_id', $data->appointment_id ?? null);
        $stmt->bindParam(':record_type', $data->record_type);
        $stmt->bindParam(':treatment', $data->treatment);
        $stmt->bindParam(':primary_diagnosis', $data->primary_diagnosis);
        $stmt->bindParam(':secondary_diagnosis', $data->secondary_diagnosis ?? null);
        $stmt->bindParam(':diagnosis_notes', $data->diagnosis_notes ?? null);
        $stmt->bindParam(':chief_complaint', $data->chief_complaint ?? null);
        $stmt->bindParam(':history_of_present_illness', $data->history_of_present_illness ?? null);
        $stmt->bindParam(':clinical_findings', $data->clinical_findings ?? null);
        $stmt->bindParam(':treatment_provided', $data->treatment_provided ?? null);
        $stmt->bindParam(':recommendations', $data->recommendations ?? null);
        $stmt->bindParam(':follow_up_instructions', $data->follow_up_instructions ?? null);
        $stmt->bindParam(':treatment_date', $data->treatment_date);
        $stmt->bindParam(':status', $data->status ?? 'active');
        
        if ($stmt->execute()) {
            $record_id = $db->lastInsertId();
            
            // Get created record
            $query = "SELECT mr.*, 
                             d.first_name as doctor_first_name, 
                             d.last_name as doctor_last_name,
                             d.title as doctor_title
                      FROM medical_records mr
                      INNER JOIN doctors d ON mr.doctor_id = d.id
                      WHERE mr.id = :record_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':record_id', $record_id);
            $stmt->execute();
            $record = $stmt->fetch(PDO::FETCH_ASSOC);
            
            sendResponse(true, 'Medical record created successfully', $record, 201);
        } else {
            sendResponse(false, 'Medical record creation failed', null, 500);
        }
        break;

    default:
        sendResponse(false, 'Method not allowed', null, 405);
}
?>


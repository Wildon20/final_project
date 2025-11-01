<?php
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
        if ($action == 'available-slots') {
            // Get available time slots (public endpoint)
            $date = $_GET['date'] ?? '';
            $service = $_GET['service'] ?? '';
            
            if (empty($date) || empty($service)) {
                sendResponse(false, 'Date and service are required', null, 400);
            }
            
            // Get doctors who provide this service
            $query = "SELECT d.* FROM doctors d 
                      INNER JOIN doctor_services ds ON d.id = ds.doctor_id 
                      INNER JOIN services s ON ds.service_code = s.code 
                      WHERE s.code = :service AND d.is_active = 1 AND d.is_available = 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':service', $service);
            $stmt->execute();
            $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($doctors)) {
                sendResponse(false, 'No doctors available for this service', null, 400);
            }
            
            // Get working hours for the date
            $day_of_week = strtolower(date('l', strtotime($date)));
            $available_slots = [];
            
            foreach ($doctors as $doctor) {
                $query = "SELECT start_time, end_time FROM doctor_working_hours 
                          WHERE doctor_id = :doctor_id AND day_of_week = :day AND is_working = 1";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':doctor_id', $doctor['id']);
                $stmt->bindParam(':day', $day_of_week);
                $stmt->execute();
                $working_hours = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($working_hours) {
                    // Generate 30-minute time slots
                    $start_time = $working_hours['start_time'];
                    $end_time = $working_hours['end_time'];
                    
                    $current_time = strtotime($start_time);
                    $end_timestamp = strtotime($end_time);
                    
                    while ($current_time < $end_timestamp) {
                        $time_slot = date('H:i', $current_time);
                        
                        // Check if slot is already booked
                        $query = "SELECT COUNT(*) as count FROM appointments 
                                  WHERE appointment_date = :date AND appointment_time = :time 
                                  AND status IN ('scheduled', 'confirmed')";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':date', $date);
                        $stmt->bindParam(':time', $time_slot);
                        $stmt->execute();
                        $is_booked = $stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
                        
                        if (!$is_booked) {
                            $available_slots[] = [
                                'time' => $time_slot,
                                'doctor' => [
                                    'id' => $doctor['id'],
                                    'name' => $doctor['title'] . ' ' . $doctor['last_name'],
                                    'specialization' => $doctor['specialization']
                                ],
                                'duration' => 30
                            ];
                        }
                        
                        $current_time += 30 * 60; // Add 30 minutes
                    }
                }
            }
            
            sendResponse(true, 'Available slots retrieved', $available_slots);
        } else {
            // Get patient appointments (protected endpoint)
            // Can use either token verification or patient_id from query
            $patient_id = null;
            
            // Try to get patient_id from query parameter
            if (isset($_GET['patient_id'])) {
                $patient_id = intval($_GET['patient_id']);
                
                // Verify token to ensure user can only access their own appointments
                $token_user_id = verifyToken();
                if ($token_user_id != $patient_id) {
                    sendResponse(false, 'Access denied. You can only view your own appointments.', null, 403);
                }
            } else {
                // If no patient_id, use token to get user ID
                $patient_id = verifyToken();
            }
            
            $status = $_GET['status'] ?? '';
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name, 
                             d.specialization as doctor_specialization, s.name as service_name
                      FROM appointments a
                      INNER JOIN doctors d ON a.doctor_id = d.id
                      INNER JOIN services s ON a.service_id = s.id
                      WHERE a.patient_id = :patient_id";
            
            if (!empty($status)) {
                $query .= " AND a.status = :status";
            }
            
            $query .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT :limit OFFSET :offset";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':patient_id', $patient_id);
            if (!empty($status)) {
                $stmt->bindParam(':status', $status);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get total count
            $count_query = "SELECT COUNT(*) as total FROM appointments WHERE patient_id = :patient_id";
            if (!empty($status)) {
                $count_query .= " AND status = :status";
            }
            $stmt = $db->prepare($count_query);
            $stmt->bindParam(':patient_id', $patient_id);
            if (!empty($status)) {
                $stmt->bindParam(':status', $status);
            }
            $stmt->execute();
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            sendResponse(true, 'Appointments retrieved', [
                'appointments' => $appointments,
                'pagination' => [
                    'current' => $page,
                    'pages' => ceil($total / $limit),
                    'total' => $total
                ]
            ]);
        }
        break;

    case 'POST':
        // Create appointment (protected endpoint)
        $patient_id = verifyToken();
        
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (empty($data->service) || empty($data->appointment_date) || 
            empty($data->appointment_time) || empty($data->payment_method)) {
            sendResponse(false, 'Required fields are missing', null, 400);
        }
        
        // Get service details
        $query = "SELECT * FROM services WHERE code = :service_code AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':service_code', $data->service);
        $stmt->execute();
        $service = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$service) {
            sendResponse(false, 'Service not found', null, 400);
        }
        
        // Check if time slot is available
        $query = "SELECT COUNT(*) as count FROM appointments 
                  WHERE appointment_date = :date AND appointment_time = :time 
                  AND status IN ('scheduled', 'confirmed')";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':date', $data->appointment_date);
        $stmt->bindParam(':time', $data->appointment_time);
        $stmt->execute();
        $is_booked = $stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
        
        if ($is_booked) {
            sendResponse(false, 'This time slot is already booked', null, 400);
        }
        
        // Find available doctor
        $query = "SELECT d.* FROM doctors d 
                  INNER JOIN doctor_services ds ON d.id = ds.doctor_id 
                  WHERE ds.service_code = :service_code AND d.is_active = 1 AND d.is_available = 1 
                  LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':service_code', $data->service);
        $stmt->execute();
        $doctor = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$doctor) {
            sendResponse(false, 'No doctor available for this service', null, 400);
        }
        
        // Create appointment
        $query = "INSERT INTO appointments 
                  (patient_id, doctor_id, service_id, service_name, appointment_date, appointment_time, 
                   duration, urgency, status, notes, patient_notes, payment_method, estimated_cost) 
                  VALUES (:patient_id, :doctor_id, :service_id, :service_name, :appointment_date, 
                          :appointment_time, :duration, :urgency, 'scheduled', :notes, :patient_notes, 
                          :payment_method, :estimated_cost)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->bindParam(':doctor_id', $doctor['id']);
        $stmt->bindParam(':service_id', $service['id']);
        $stmt->bindParam(':service_name', $data->service_name ?? $service['name']);
        $stmt->bindParam(':appointment_date', $data->appointment_date);
        $stmt->bindParam(':appointment_time', $data->appointment_time);
        $stmt->bindParam(':duration', $service['duration']);
        $stmt->bindParam(':urgency', $data->urgency ?? 'routine');
        $stmt->bindParam(':notes', $data->notes ?? '');
        $stmt->bindParam(':patient_notes', $data->patient_notes ?? '');
        $stmt->bindParam(':payment_method', $data->payment_method);
        $stmt->bindParam(':estimated_cost', $data->estimated_cost ?? $service['base_price']);
        
        if ($stmt->execute()) {
            $appointment_id = $db->lastInsertId();
            
            // Get created appointment with doctor details
            $query = "SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name, 
                             d.specialization as doctor_specialization
                      FROM appointments a
                      INNER JOIN doctors d ON a.doctor_id = d.id
                      WHERE a.id = :appointment_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':appointment_id', $appointment_id);
            $stmt->execute();
            $appointment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            sendResponse(true, 'Appointment created successfully', $appointment, 201);
        } else {
            sendResponse(false, 'Appointment creation failed', null, 500);
        }
        break;

    case 'PUT':
        // Update appointment (protected endpoint)
        $patient_id = verifyToken();
        $appointment_id = $request[0] ?? '';
        
        if (empty($appointment_id)) {
            sendResponse(false, 'Appointment ID is required', null, 400);
        }
        
        // Check if appointment belongs to patient
        $query = "SELECT * FROM appointments WHERE id = :id AND patient_id = :patient_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $appointment_id);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->execute();
        $appointment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$appointment) {
            sendResponse(false, 'Appointment not found', null, 404);
        }
        
        // Check if appointment can be updated
        if (in_array($appointment['status'], ['completed', 'cancelled'])) {
            sendResponse(false, 'Cannot update completed or cancelled appointment', null, 400);
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        // Update appointment
        $query = "UPDATE appointments SET 
                  appointment_date = :appointment_date, 
                  appointment_time = :appointment_time, 
                  notes = :notes, 
                  patient_notes = :patient_notes, 
                  payment_method = :payment_method,
                  updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':appointment_date', $data->appointment_date ?? $appointment['appointment_date']);
        $stmt->bindParam(':appointment_time', $data->appointment_time ?? $appointment['appointment_time']);
        $stmt->bindParam(':notes', $data->notes ?? $appointment['notes']);
        $stmt->bindParam(':patient_notes', $data->patient_notes ?? $appointment['patient_notes']);
        $stmt->bindParam(':payment_method', $data->payment_method ?? $appointment['payment_method']);
        $stmt->bindParam(':id', $appointment_id);
        
        if ($stmt->execute()) {
            sendResponse(true, 'Appointment updated successfully');
        } else {
            sendResponse(false, 'Appointment update failed', null, 500);
        }
        break;

    case 'DELETE':
        // Cancel appointment (protected endpoint)
        $patient_id = verifyToken();
        $appointment_id = $request[0] ?? '';
        
        if (empty($appointment_id)) {
            sendResponse(false, 'Appointment ID is required', null, 400);
        }
        
        // Check if appointment belongs to patient
        $query = "SELECT * FROM appointments WHERE id = :id AND patient_id = :patient_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $appointment_id);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->execute();
        $appointment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$appointment) {
            sendResponse(false, 'Appointment not found', null, 404);
        }
        
        // Check if appointment can be cancelled
        if (in_array($appointment['status'], ['completed', 'cancelled'])) {
            sendResponse(false, 'Appointment cannot be cancelled', null, 400);
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        // Cancel appointment
        $query = "UPDATE appointments SET 
                  status = 'cancelled', 
                  cancellation_reason = :reason, 
                  cancelled_by = 'patient', 
                  cancelled_at = NOW(),
                  updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':reason', $data->cancellation_reason ?? '');
        $stmt->bindParam(':id', $appointment_id);
        
        if ($stmt->execute()) {
            sendResponse(true, 'Appointment cancelled successfully');
        } else {
            sendResponse(false, 'Appointment cancellation failed', null, 500);
        }
        break;

    default:
        sendResponse(false, 'Method not allowed', null, 405);
}
?>


<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
$action = $request[0] ?? '';

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

switch ($method) {
    case 'GET':
        switch ($action) {
            case '':
                // Get all services
                $category = $_GET['category'] ?? '';
                $featured = $_GET['featured'] ?? '';
                $popular = $_GET['popular'] ?? '';
                $page = intval($_GET['page'] ?? 1);
                $limit = intval($_GET['limit'] ?? 20);
                $offset = ($page - 1) * $limit;
                
                $query = "SELECT * FROM services WHERE is_active = 1";
                $params = [];
                
                if (!empty($category)) {
                    $query .= " AND category = :category";
                    $params[':category'] = $category;
                }
                
                if ($featured === 'true') {
                    $query .= " AND is_featured = 1";
                }
                
                if ($popular === 'true') {
                    $query .= " AND is_popular = 1";
                }
                
                $query .= " ORDER BY is_featured DESC, is_popular DESC, created_at DESC LIMIT :limit OFFSET :offset";
                
                $stmt = $db->prepare($query);
                foreach ($params as $key => $value) {
                    $stmt->bindParam($key, $value);
                }
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
                $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get total count
                $count_query = "SELECT COUNT(*) as total FROM services WHERE is_active = 1";
                if (!empty($category)) {
                    $count_query .= " AND category = :category";
                }
                if ($featured === 'true') {
                    $count_query .= " AND is_featured = 1";
                }
                if ($popular === 'true') {
                    $count_query .= " AND is_popular = 1";
                }
                
                $stmt = $db->prepare($count_query);
                foreach ($params as $key => $value) {
                    $stmt->bindParam($key, $value);
                }
                $stmt->execute();
                $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
                
                sendResponse(true, 'Services retrieved', [
                    'services' => $services,
                    'pagination' => [
                        'current' => $page,
                        'pages' => ceil($total / $limit),
                        'total' => $total
                    ]
                ]);
                break;
                
            case 'featured':
                // Get featured services
                $limit = intval($_GET['limit'] ?? 6);
                
                $query = "SELECT * FROM services 
                          WHERE is_active = 1 AND is_featured = 1 
                          ORDER BY total_bookings DESC, created_at DESC 
                          LIMIT :limit";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
                $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                sendResponse(true, 'Featured services retrieved', $services);
                break;
                
            case 'popular':
                // Get popular services
                $limit = intval($_GET['limit'] ?? 6);
                
                $query = "SELECT * FROM services 
                          WHERE is_active = 1 AND is_popular = 1 
                          ORDER BY total_bookings DESC, average_rating DESC 
                          LIMIT :limit";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
                $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                sendResponse(true, 'Popular services retrieved', $services);
                break;
                
            case 'categories':
                // Get service categories
                $query = "SELECT category, COUNT(*) as count FROM services 
                          WHERE is_active = 1 
                          GROUP BY category 
                          ORDER BY category";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                sendResponse(true, 'Service categories retrieved', $categories);
                break;
                
            case 'search':
                // Search services
                $q = $_GET['q'] ?? '';
                $category = $_GET['category'] ?? '';
                $min_price = $_GET['minPrice'] ?? '';
                $max_price = $_GET['maxPrice'] ?? '';
                $page = intval($_GET['page'] ?? 1);
                $limit = intval($_GET['limit'] ?? 20);
                $offset = ($page - 1) * $limit;
                
                if (empty($q) || strlen($q) < 2) {
                    sendResponse(false, 'Search query must be at least 2 characters long', null, 400);
                }
                
                $query = "SELECT * FROM services 
                          WHERE is_active = 1 AND (
                              name LIKE :search OR 
                              description LIKE :search OR 
                              detailed_description LIKE :search OR 
                              keywords LIKE :search
                          )";
                $params = [':search' => "%$q%"];
                
                if (!empty($category)) {
                    $query .= " AND category = :category";
                    $params[':category'] = $category;
                }
                
                if (!empty($min_price)) {
                    $query .= " AND base_price >= :min_price";
                    $params[':min_price'] = $min_price;
                }
                
                if (!empty($max_price)) {
                    $query .= " AND base_price <= :max_price";
                    $params[':max_price'] = $max_price;
                }
                
                $query .= " ORDER BY is_featured DESC, is_popular DESC, total_bookings DESC 
                           LIMIT :limit OFFSET :offset";
                
                $stmt = $db->prepare($query);
                foreach ($params as $key => $value) {
                    $stmt->bindParam($key, $value);
                }
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
                $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get total count
                $count_query = "SELECT COUNT(*) as total FROM services 
                                WHERE is_active = 1 AND (
                                    name LIKE :search OR 
                                    description LIKE :search OR 
                                    detailed_description LIKE :search OR 
                                    keywords LIKE :search
                                )";
                if (!empty($category)) {
                    $count_query .= " AND category = :category";
                }
                if (!empty($min_price)) {
                    $count_query .= " AND base_price >= :min_price";
                }
                if (!empty($max_price)) {
                    $count_query .= " AND base_price <= :max_price";
                }
                
                $stmt = $db->prepare($count_query);
                foreach ($params as $key => $value) {
                    $stmt->bindParam($key, $value);
                }
                $stmt->execute();
                $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
                
                sendResponse(true, 'Search results retrieved', [
                    'services' => $services,
                    'pagination' => [
                        'current' => $page,
                        'pages' => ceil($total / $limit),
                        'total' => $total
                    ]
                ]);
                break;
                
            default:
                // Get service by ID or code
                $identifier = $action;
                
                // Check if it's a numeric ID
                if (is_numeric($identifier)) {
                    $query = "SELECT * FROM services WHERE id = :id AND is_active = 1";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':id', $identifier, PDO::PARAM_INT);
                } else {
                    // Assume it's a service code
                    $query = "SELECT * FROM services WHERE code = :code AND is_active = 1";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':code', $identifier);
                }
                
                $stmt->execute();
                $service = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$service) {
                    sendResponse(false, 'Service not found', null, 404);
                }
                
                sendResponse(true, 'Service retrieved', $service);
                break;
        }
        break;
        
    default:
        sendResponse(false, 'Method not allowed', null, 405);
}
?>


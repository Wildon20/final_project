<?php
class Patient {
    private $conn;
    private $table_name = "patients";

    public $id;
    public $first_name;
    public $last_name;
    public $email;
    public $phone;
    public $date_of_birth;
    public $gender;
    public $password;
    public $street_address;
    public $city;
    public $postal_code;
    public $country;
    public $emergency_contact_name;
    public $emergency_contact_relationship;
    public $emergency_contact_phone;
    public $insurance_provider;
    public $insurance_member_id;
    public $insurance_group_number;
    public $insurance_active;
    public $allergies;
    public $medications;
    public $medical_conditions;
    public $previous_dental_work;
    public $preferred_contact_method;
    public $marketing_consent;
    public $reminder_consent;
    public $is_active;
    public $is_verified;
    public $verification_token;
    public $reset_password_token;
    public $reset_password_expire;
    public $last_login;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new patient
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET first_name=:first_name, last_name=:last_name, email=:email, 
                      phone=:phone, date_of_birth=:date_of_birth, gender=:gender, 
                      password=:password, street_address=:street_address, city=:city, 
                      postal_code=:postal_code, country=:country, 
                      emergency_contact_name=:emergency_contact_name, 
                      emergency_contact_relationship=:emergency_contact_relationship, 
                      emergency_contact_phone=:emergency_contact_phone, 
                      insurance_provider=:insurance_provider, 
                      insurance_member_id=:insurance_member_id, 
                      insurance_group_number=:insurance_group_number, 
                      insurance_active=:insurance_active, 
                      allergies=:allergies, medications=:medications, 
                      medical_conditions=:medical_conditions, 
                      previous_dental_work=:previous_dental_work, 
                      preferred_contact_method=:preferred_contact_method, 
                      marketing_consent=:marketing_consent, 
                      reminder_consent=:reminder_consent";

        $stmt = $this->conn->prepare($query);

        // Hash password
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);

        // Bind values
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":date_of_birth", $this->date_of_birth);
        $stmt->bindParam(":gender", $this->gender);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":street_address", $this->street_address);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":postal_code", $this->postal_code);
        $stmt->bindParam(":country", $this->country);
        $stmt->bindParam(":emergency_contact_name", $this->emergency_contact_name);
        $stmt->bindParam(":emergency_contact_relationship", $this->emergency_contact_relationship);
        $stmt->bindParam(":emergency_contact_phone", $this->emergency_contact_phone);
        $stmt->bindParam(":insurance_provider", $this->insurance_provider);
        $stmt->bindParam(":insurance_member_id", $this->insurance_member_id);
        $stmt->bindParam(":insurance_group_number", $this->insurance_group_number);
        $stmt->bindParam(":insurance_active", $this->insurance_active);
        $stmt->bindParam(":allergies", $this->allergies);
        $stmt->bindParam(":medications", $this->medications);
        $stmt->bindParam(":medical_conditions", $this->medical_conditions);
        $stmt->bindParam(":previous_dental_work", $this->previous_dental_work);
        $stmt->bindParam(":preferred_contact_method", $this->preferred_contact_method);
        $stmt->bindParam(":marketing_consent", $this->marketing_consent);
        $stmt->bindParam(":reminder_consent", $this->reminder_consent);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Get patient by email
    public function getByEmail() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->date_of_birth = $row['date_of_birth'];
            $this->gender = $row['gender'];
            $this->password = $row['password'];
            $this->street_address = $row['street_address'];
            $this->city = $row['city'];
            $this->postal_code = $row['postal_code'];
            $this->country = $row['country'];
            $this->emergency_contact_name = $row['emergency_contact_name'];
            $this->emergency_contact_relationship = $row['emergency_contact_relationship'];
            $this->emergency_contact_phone = $row['emergency_contact_phone'];
            $this->insurance_provider = $row['insurance_provider'];
            $this->insurance_member_id = $row['insurance_member_id'];
            $this->insurance_group_number = $row['insurance_group_number'];
            $this->insurance_active = $row['insurance_active'];
            $this->allergies = $row['allergies'];
            $this->medications = $row['medications'];
            $this->medical_conditions = $row['medical_conditions'];
            $this->previous_dental_work = $row['previous_dental_work'];
            $this->preferred_contact_method = $row['preferred_contact_method'];
            $this->marketing_consent = $row['marketing_consent'];
            $this->reminder_consent = $row['reminder_consent'];
            $this->is_active = $row['is_active'];
            $this->is_verified = $row['is_verified'];
            $this->last_login = $row['last_login'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    // Get patient by ID
    public function getById() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->date_of_birth = $row['date_of_birth'];
            $this->gender = $row['gender'];
            $this->street_address = $row['street_address'];
            $this->city = $row['city'];
            $this->postal_code = $row['postal_code'];
            $this->country = $row['country'];
            $this->emergency_contact_name = $row['emergency_contact_name'];
            $this->emergency_contact_relationship = $row['emergency_contact_relationship'];
            $this->emergency_contact_phone = $row['emergency_contact_phone'];
            $this->insurance_provider = $row['insurance_provider'];
            $this->insurance_member_id = $row['insurance_member_id'];
            $this->insurance_group_number = $row['insurance_group_number'];
            $this->insurance_active = $row['insurance_active'];
            $this->allergies = $row['allergies'];
            $this->medications = $row['medications'];
            $this->medical_conditions = $row['medical_conditions'];
            $this->previous_dental_work = $row['previous_dental_work'];
            $this->preferred_contact_method = $row['preferred_contact_method'];
            $this->marketing_consent = $row['marketing_consent'];
            $this->reminder_consent = $row['reminder_consent'];
            $this->is_active = $row['is_active'];
            $this->is_verified = $row['is_verified'];
            $this->last_login = $row['last_login'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    // Verify password
    public function verifyPassword($password) {
        return password_verify($password, $this->password);
    }

    // Update last login
    public function updateLastLogin() {
        $query = "UPDATE " . $this->table_name . " SET last_login = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    // Update profile
    public function updateProfile() {
        $query = "UPDATE " . $this->table_name . " 
                  SET first_name=:first_name, last_name=:last_name, phone=:phone, 
                      street_address=:street_address, city=:city, postal_code=:postal_code, 
                      country=:country, emergency_contact_name=:emergency_contact_name, 
                      emergency_contact_relationship=:emergency_contact_relationship, 
                      emergency_contact_phone=:emergency_contact_phone, 
                      insurance_provider=:insurance_provider, 
                      insurance_member_id=:insurance_member_id, 
                      insurance_group_number=:insurance_group_number, 
                      insurance_active=:insurance_active, 
                      allergies=:allergies, medications=:medications, 
                      medical_conditions=:medical_conditions, 
                      previous_dental_work=:previous_dental_work, 
                      preferred_contact_method=:preferred_contact_method, 
                      marketing_consent=:marketing_consent, 
                      reminder_consent=:reminder_consent,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":street_address", $this->street_address);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":postal_code", $this->postal_code);
        $stmt->bindParam(":country", $this->country);
        $stmt->bindParam(":emergency_contact_name", $this->emergency_contact_name);
        $stmt->bindParam(":emergency_contact_relationship", $this->emergency_contact_relationship);
        $stmt->bindParam(":emergency_contact_phone", $this->emergency_contact_phone);
        $stmt->bindParam(":insurance_provider", $this->insurance_provider);
        $stmt->bindParam(":insurance_member_id", $this->insurance_member_id);
        $stmt->bindParam(":insurance_group_number", $this->insurance_group_number);
        $stmt->bindParam(":insurance_active", $this->insurance_active);
        $stmt->bindParam(":allergies", $this->allergies);
        $stmt->bindParam(":medications", $this->medications);
        $stmt->bindParam(":medical_conditions", $this->medical_conditions);
        $stmt->bindParam(":previous_dental_work", $this->previous_dental_work);
        $stmt->bindParam(":preferred_contact_method", $this->preferred_contact_method);
        $stmt->bindParam(":marketing_consent", $this->marketing_consent);
        $stmt->bindParam(":reminder_consent", $this->reminder_consent);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Change password
    public function changePassword($new_password) {
        $query = "UPDATE " . $this->table_name . " 
                  SET password = :password, updated_at = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Get full name
    public function getFullName() {
        return $this->first_name . ' ' . $this->last_name;
    }
}
?>


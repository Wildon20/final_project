# DR T Dental PHP Backend

A complete PHP backend system for the DR T Dental clinic website using XAMPP, MySQL, and JWT authentication.

## 🚀 Quick Start with XAMPP

### **Step 1: Install XAMPP**
1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install XAMPP (includes Apache, MySQL, PHP, phpMyAdmin)
3. Start XAMPP Control Panel
4. Start **Apache** and **MySQL** services

### **Step 2: Setup Project**
1. Copy the `php-backend` folder to your XAMPP `htdocs` directory:
   ```
   C:\xampp\htdocs\php-backend\
   ```

2. Open phpMyAdmin: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)

3. Import the database:
   - Click "Import" tab
   - Choose file: `php-backend/sql/database_setup.sql`
   - Click "Go"

### **Step 3: Test the API**
Your API will be available at: `http://localhost/php-backend/api/`

## 📁 Project Structure

```
php-backend/
├── api/
│   ├── auth.php              # Authentication endpoints
│   ├── appointments.php      # Appointment management
│   └── services.php          # Service catalog
├── config/
│   └── database.php          # Database connection
├── models/
│   └── Patient.php           # Patient model
├── utils/
│   └── jwt.php              # JWT token handling
├── sql/
│   └── database_setup.sql   # Database schema
└── README.md
```

## 🔗 API Endpoints

### **Authentication** (`/api/auth.php`)

#### Register Patient
```http
POST /api/auth.php/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+26812345678",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "password": "Password123"
}
```

#### Login Patient
```http
POST /api/auth.php/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Current Patient
```http
GET /api/auth.php/me
Authorization: Bearer <jwt-token>
```

#### Update Profile
```http
PUT /api/auth.php/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+26812345679"
}
```

### **Appointments** (`/api/appointments.php`)

#### Create Appointment
```http
POST /api/appointments.php
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "service": "CONSULTATION",
  "appointment_date": "2025-02-15",
  "appointment_time": "09:00",
  "urgency": "routine",
  "payment_method": "insurance"
}
```

#### Get Patient Appointments
```http
GET /api/appointments.php?status=scheduled&page=1&limit=10
Authorization: Bearer <jwt-token>
```

#### Get Available Time Slots
```http
GET /api/appointments.php/available-slots?date=2025-02-15&service=CONSULTATION
```

#### Update Appointment
```http
PUT /api/appointments.php/1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "appointment_date": "2025-02-16",
  "appointment_time": "10:00"
}
```

#### Cancel Appointment
```http
DELETE /api/appointments.php/1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "cancellation_reason": "Schedule conflict"
}
```

### **Services** (`/api/services.php`)

#### Get All Services
```http
GET /api/services.php?category=general&featured=true&page=1&limit=20
```

#### Get Featured Services
```http
GET /api/services.php/featured?limit=6
```

#### Search Services
```http
GET /api/services.php/search?q=cleaning&category=general&minPrice=50&maxPrice=200
```

#### Get Service by ID
```http
GET /api/services.php/1
```

#### Get Service by Code
```http
GET /api/services.php/CONSULTATION
```

## 🗄️ Database Schema

### **Main Tables:**
- `patients` - Patient information and authentication
- `doctors` - Doctor/staff information
- `services` - Service catalog
- `appointments` - Appointment bookings
- `medical_records` - Patient treatment records
- `doctor_working_hours` - Doctor availability
- `doctor_services` - Doctor service assignments

### **Sample Data Included:**
- 2 sample doctors
- 4 sample services (Consultation, Cleaning, Whitening, Implants)
- Working hours configuration
- Service assignments

## 🔧 Configuration

### **Database Connection**
Edit `config/database.php` if needed:
```php
private $host = "localhost";
private $db_name = "drt_dental";
private $username = "root";
private $password = "";
```

### **JWT Secret**
Edit `utils/jwt.php`:
```php
define('JWT_SECRET', 'your-super-secret-jwt-key-here');
```

## 🧪 Testing the API

### **Using cURL:**

#### Register a new patient:
```bash
curl -X POST http://localhost/php-backend/api/auth.php/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+26812345678",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "password": "Password123"
  }'
```

#### Login:
```bash
curl -X POST http://localhost/php-backend/api/auth.php/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

#### Get services:
```bash
curl -X GET http://localhost/php-backend/api/services.php
```

### **Using Postman:**
1. Import the API endpoints
2. Set base URL: `http://localhost/php-backend/api/`
3. Add Authorization header for protected endpoints

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - PHP `password_hash()` with bcrypt
- **Input Validation** - Server-side validation
- **CORS Headers** - Cross-origin request handling
- **SQL Injection Prevention** - PDO prepared statements

## 📱 Frontend Integration

### **JavaScript Example:**
```javascript
// Register patient
const registerPatient = async (patientData) => {
  const response = await fetch('http://localhost/php-backend/api/auth.php/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData)
  });
  
  const data = await response.json();
  return data;
};

// Create appointment
const createAppointment = async (appointmentData, token) => {
  const response = await fetch('http://localhost/php-backend/api/appointments.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(appointmentData)
  });
  
  const data = await response.json();
  return data;
};
```

## 🚀 Deployment

### **Production Setup:**
1. **Web Server**: Apache/Nginx
2. **PHP**: Version 7.4 or higher
3. **MySQL**: Version 5.7 or higher
4. **SSL Certificate**: For HTTPS
5. **Environment Variables**: Move sensitive data to `.env` files

### **Security Considerations:**
- Change default JWT secret
- Use environment variables for database credentials
- Enable HTTPS
- Set up proper file permissions
- Regular database backups

## 🐛 Troubleshooting

### **Common Issues:**

1. **500 Internal Server Error**
   - Check PHP error logs
   - Verify database connection
   - Check file permissions

2. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials
   - Ensure database exists

3. **CORS Issues**
   - Check CORS headers in API files
   - Verify frontend URL configuration

4. **JWT Token Issues**
   - Check JWT secret configuration
   - Verify token format in requests

## 📞 Support

For issues or questions:
- Check the error logs in XAMPP
- Verify all requirements are met
- Test with Postman or cURL first

## 🔄 Next Steps

1. **Add More API Endpoints**:
   - Medical records management
   - Doctor management
   - Admin panel APIs

2. **Enhance Security**:
   - Rate limiting
   - Input sanitization
   - CSRF protection

3. **Add Features**:
   - Email notifications
   - File upload handling
   - Advanced search

4. **Frontend Integration**:
   - Connect your existing HTML/CSS/JS
   - Add AJAX calls to API endpoints
   - Implement user authentication flow

Your PHP backend is now ready to integrate with your existing dental clinic website!


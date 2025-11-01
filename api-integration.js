// DR T DENTAL API Integration
// This script handles all API calls to your PHP backend

// Auto-detect the correct API base URL
function getAPIBaseURL() {
    // MANUAL CONFIGURATION - Uncomment and set the correct path for your setup:
    
    // Option 1: XAMPP default (project directly in htdocs/graduation-project)
    // return 'http://localhost/graduation-project/php-backend/api';
    
    // Option 2: XAMPP with port (if using custom port)
    // return 'http://localhost:8080/graduation-project/php-backend/api';
    
    // Option 3: XAMPP default (php-backend directly in htdocs)
    // return 'http://localhost/php-backend/api';
    
    // Option 4: Auto-detect based on current location (default behavior)
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    // Extract the path from current URL
    const pathParts = currentPath.split('/').filter(p => p);
    
    // Remove filename if present
    if (pathParts.length > 0 && pathParts[pathParts.length - 1].includes('.')) {
        pathParts.pop();
    }
    
    const relativePath = pathParts.join('/');
    
    console.log('Relative path parts:', pathParts);
    console.log('Relative path:', relativePath);
    
    // Build the API URL based on current location
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    
    // Construct URL with full path
    let apiUrl;
    if (port) {
        apiUrl = relativePath 
            ? `${protocol}//${host}:${port}/${relativePath}/php-backend/api`
            : `${protocol}//${host}:${port}/php-backend/api`;
    } else {
        apiUrl = relativePath 
            ? `${protocol}//${host}/${relativePath}/php-backend/api`
            : `${protocol}//${host}/php-backend/api`;
    }
    
    console.log('Detected API URL:', apiUrl);
    console.log('Full URL will be:', apiUrl + '/auth.php?action=register');
    
    return apiUrl;
}

// Try multiple possible API URLs
function testAPIUrl(url) {
    console.log('Testing URL:', url);
    fetch(url + '?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test', password: 'test' })
    })
    .then(response => {
        console.log(`✅ URL WORKS! ${url} - Status: ${response.status}`);
        return response.text();
    })
    .then(text => console.log('Response:', text))
    .catch(error => console.log(`❌ URL failed: ${url} - Error: ${error.message}`));
}

const API_BASE_URL = getAPIBaseURL();
console.log('=== API CONFIGURATION ===');
console.log('Current location:', window.location.href);
console.log('API Base URL:', API_BASE_URL);
console.log('Test URL:', API_BASE_URL + '/auth.php?action=register');
console.log('======================');

// API Helper Functions
class DentalAPI {
    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${API_BASE_URL}/${endpoint}`;
        console.log('API Request:', {
            method,
            url,
            endpoint,
            data: data ? 'Data present' : 'No data'
        });
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Attach JWT token if available
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (e) {
            // ignore storage errors
        }

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            console.log('Sending request to:', url);
            const response = await fetch(url, options);
            console.log('Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = `Failed to read error response. Status: ${response.status}`;
                }
                console.error('Response error:', errorText);
                
                let errorMessage = `HTTP error! status: ${response.status}`;
                if (response.status === 404) {
                    errorMessage = `Page not found (404). The API endpoint '${endpoint}' does not exist. Please check if the PHP backend is running and the file path is correct.`;
                }
                throw new Error(errorMessage);
            }
            
            let responseText = '';
            try {
                responseText = await response.text();
                const jsonResponse = JSON.parse(responseText);
                console.log('API Response:', jsonResponse);
                return jsonResponse;
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                console.log('Response text:', responseText);
                throw new Error('Invalid JSON response from server');
            }
        } catch (error) {
            console.error('API Error Details:', {
                error: error.message,
                url: url,
                endpoint: endpoint,
                method: method
            });
            throw error;
        }
    }

    // Services API
    static async getServices() {
        return await this.makeRequest('services.php');
    }

    static async getServiceById(id) {
        return await this.makeRequest(`services.php?id=${id}`);
    }

    // Appointments API
    static async createAppointment(appointmentData) {
        return await this.makeRequest('appointments.php', 'POST', appointmentData);
    }

    static async getAppointments(patientId) {
        const response = await this.makeRequest(`appointments.php?patient_id=${patientId}`);
        // Return appointments array directly if response has data.appointments
        if (response && response.data && response.data.appointments) {
            return response.data.appointments;
        }
        return response?.data || [];
    }

    static async getAvailableSlots(doctorId, date, serviceId) {
        return await this.makeRequest(`appointments.php?action=slots&doctor_id=${doctorId}&date=${date}&service_id=${serviceId}`);
    }

    // Patient API
    static async registerPatient(patientData) {
        return await this.makeRequest('auth.php?action=register', 'POST', patientData);
    }

    static async loginPatient(email, password) {
        return await this.makeRequest('auth.php?action=login', 'POST', { email, password });
    }

    // Medical Records API
    static async getMedicalRecords(patientId) {
        const response = await this.makeRequest(`medicalRecords.php?patient_id=${patientId}`);
        // Return records array directly if response has data.records
        if (response && response.data && response.data.records) {
            return response.data.records;
        }
        return response?.data || [];
    }
}

// Frontend Integration Functions
class DentalFrontend {
    static isAuthenticated() {
        try {
            const token = localStorage.getItem('authToken');
            return Boolean(token);
        } catch (_) {
            return false;
        }
    }

    static requireAuth(redirectPath = window.location.pathname) {
        if (!this.isAuthenticated()) {
            const target = redirectPath || 'index.html';
            const url = `patient-portal.html?redirect=${encodeURIComponent(target)}`;
            window.location.href = url;
            return false;
        }
        return true;
    }

    static saveAuth(token, patientId) {
        try {
            if (token) localStorage.setItem('authToken', token);
            if (patientId) localStorage.setItem('patientId', String(patientId));
        } catch (_) {
            // no-op
        }
    }

    static logout() {
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('patientId');
        } catch (_) {
            // no-op
        }
    }
    static async loadServices() {
        try {
            const services = await DentalAPI.getServices();
            this.displayServices(services);
        } catch (error) {
            console.error('Failed to load services:', error);
            this.showError('Failed to load services. Please try again.');
        }
    }

    static displayServices(services) {
        const servicesContainer = document.getElementById('services-container');
        if (!servicesContainer) return;

        servicesContainer.innerHTML = services.map(service => `
            <div class="col-md-4 mb-4">
                <div class="service-card">
                    <h5>${service.name}</h5>
                    <p>${service.description}</p>
                    <p class="price">$${service.base_price}</p>
                    <button class="btn btn-primary" onclick="DentalFrontend.selectService(${service.id})">
                        Book Now
                    </button>
                </div>
            </div>
        `).join('');
    }

    static selectService(serviceId) {
        // Store selected service and redirect to appointment page
        localStorage.setItem('selectedServiceId', serviceId);
        window.location.href = 'appointment.html';
    }

    static async loadAppointmentForm() {
        const selectedServiceId = localStorage.getItem('selectedServiceId');
        if (selectedServiceId) {
            try {
                const service = await DentalAPI.getServiceById(selectedServiceId);
                this.populateServiceInfo(service);
            } catch (error) {
                console.error('Failed to load service details:', error);
            }
        }
    }

    static populateServiceInfo(service) {
        const serviceInfoElement = document.getElementById('selected-service-info');
        if (serviceInfoElement) {
            serviceInfoElement.innerHTML = `
                <h5>Selected Service: ${service.name}</h5>
                <p>Duration: ${service.duration} minutes</p>
                <p>Price: $${service.base_price}</p>
            `;
        }
    }

    static async submitAppointmentForm(formData) {
        try {
            const appointmentData = {
                service_id: formData.serviceId,
                patient_id: formData.patientId,
                appointment_date: formData.appointmentDate,
                appointment_time: formData.appointmentTime,
                notes: formData.notes,
                payment_method: formData.paymentMethod
            };

            const result = await DentalAPI.createAppointment(appointmentData);
            this.showSuccess('Appointment booked successfully!');
            return result;
        } catch (error) {
            console.error('Failed to book appointment:', error);
            this.showError('Failed to book appointment. Please try again.');
        }
    }

    static async loadPatientDashboard(patientId) {
        try {
            const [appointments, medicalRecords] = await Promise.all([
                DentalAPI.getAppointments(patientId),
                DentalAPI.getMedicalRecords(patientId)
            ]);

            this.displayAppointments(appointments);
            this.displayMedicalRecords(medicalRecords);
        } catch (error) {
            console.error('Failed to load patient data:', error);
            this.showError('Failed to load your data. Please try again.');
        }
    }

    static displayAppointments(appointments) {
        const appointmentsContainer = document.getElementById('appointments-container');
        if (!appointmentsContainer) return;

        appointmentsContainer.innerHTML = appointments.map(appointment => `
            <div class="appointment-item">
                <h6>${appointment.service_name}</h6>
                <p>Date: ${appointment.appointment_date}</p>
                <p>Time: ${appointment.appointment_time}</p>
                <span class="status-badge status-${appointment.status}">${appointment.status}</span>
            </div>
        `).join('');
    }

    static displayMedicalRecords(records) {
        // Try both possible container IDs
        const recordsContainer = document.getElementById('medical-records-container') || 
                                 document.getElementById('medicalRecords');
        if (!recordsContainer) {
            console.warn('Medical records container not found');
            return;
        }

        if (!records || records.length === 0) {
            recordsContainer.innerHTML = '<p class="text-muted">No medical records found.</p>';
            return;
        }

        recordsContainer.innerHTML = records.map(record => `
            <div class="medical-record">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6>${record.treatment || 'Treatment'}</h6>
                        <p class="mb-2">${record.treatment_provided || record.primary_diagnosis || 'No details available'}</p>
                        <small class="text-muted">${record.doctor_name || 'Doctor'} - ${record.treatment_date || ''}</small>
                        ${record.primary_diagnosis ? `<br><small class="text-muted">Diagnosis: ${record.primary_diagnosis}</small>` : ''}
                    </div>
                    <span class="status-badge status-${record.status || 'completed'}">${(record.status || 'completed').toUpperCase()}</span>
                </div>
            </div>
        `).join('');
    }

    static showSuccess(message) {
        // Create and show success notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.insertBefore(notification, document.body.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    static showError(message) {
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-danger alert-dismissible fade show';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.insertBefore(notification, document.body.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize API integration when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load services on services page
    if (window.location.pathname.includes('services.html')) {
        DentalFrontend.loadServices();
    }
    
    // Load appointment form data
    if (window.location.pathname.includes('appointment.html')) {
        DentalFrontend.loadAppointmentForm();
    }
    
    // Load patient dashboard
    if (window.location.pathname.includes('patient-portal.html')) {
        const patientId = localStorage.getItem('patientId');
        if (patientId) {
            DentalFrontend.loadPatientDashboard(patientId);
        }
    }
});

// Export for global use
window.DentalAPI = DentalAPI;
window.DentalFrontend = DentalFrontend;

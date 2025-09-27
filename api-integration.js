// DR T DENTAL API Integration
// This script handles all API calls to your PHP backend

const API_BASE_URL = 'http://localhost/php-backend/api';

// API Helper Functions
class DentalAPI {
    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${API_BASE_URL}/${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
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
        return await this.makeRequest(`appointments.php?patient_id=${patientId}`);
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
        return await this.makeRequest(`medicalRecords.php?patient_id=${patientId}`);
    }
}

// Frontend Integration Functions
class DentalFrontend {
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
        const recordsContainer = document.getElementById('medical-records-container');
        if (!recordsContainer) return;

        recordsContainer.innerHTML = records.map(record => `
            <div class="medical-record-item">
                <h6>${record.treatment}</h6>
                <p>Date: ${record.treatment_date}</p>
                <p>Doctor: ${record.doctor_name}</p>
                <p>Diagnosis: ${record.primary_diagnosis}</p>
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

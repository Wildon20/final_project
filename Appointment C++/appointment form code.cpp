#include <iostream>
#include <string>

struct Appointment {
    std::string date;
    std::string time;
    std::string name;
};

void bookAppointment(Appointment &appointment) {
    std::cout << "Enter appointment date (YYYY-MM-DD): ";
    std::cin >> appointment.date;
    
    std::cout << "Enter appointment time (HH:MM): ";
    std::cin >> appointment.time;
    
    std::cout << "Enter your name: ";
    std::cin.ignore(); // Ignore leftover newline character
    std::getline(std::cin, appointment.name);
    
    std::cout << "\nAppointment Details:\n";
    std::cout << "Date: " << appointment.date << "\n";
    std::cout << "Time: " << appointment.time << "\n";
    std::cout << "Name: " << appointment.name << "\n";
}

int main() {
    Appointment appointment;
    bookAppointment(appointment);
    return 0;
}

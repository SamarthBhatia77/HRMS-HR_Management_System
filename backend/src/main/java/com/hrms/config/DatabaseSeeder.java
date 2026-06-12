package com.hrms.config;

import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.security.Role;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          EmployeeRepository employeeRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@hrms.com";
        String adminPassword = "admin123";

        log.info("Checking database for HR Admin: {}", adminEmail);

        Optional<AppUser> userOpt = userRepository.findByEmail(adminEmail);
        AppUser adminUser;
        if (userOpt.isEmpty()) {
            log.info("HR Admin user not found. Seeding to database...");
            adminUser = new AppUser(
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    Role.HR_ADMIN,
                    "ACTIVE"
            );
            adminUser.setId("a0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            adminUser = userRepository.save(adminUser);
        } else {
            adminUser = userOpt.get();
            log.info("HR Admin user exists. Ensuring status is ACTIVE and password is correct...");
            adminUser.setStatus("ACTIVE");
            adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
            adminUser = userRepository.save(adminUser);
        }

        Optional<Employee> empOpt = employeeRepository.findByUserId(adminUser.getId());
        if (empOpt.isEmpty()) {
            log.info("HR Admin employee profile not found. Seeding to database...");
            Employee adminEmployee = new Employee(
                    adminUser,
                    null,
                    "HR Administrator",
                    "Human Resources",
                    "HR Manager",
                    LocalDate.now(),
                    "ACTIVE"
            );
            adminEmployee.setId("e0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            employeeRepository.save(adminEmployee);
        } else {
            Employee adminEmployee = empOpt.get();
            adminEmployee.setEmploymentStatus("ACTIVE");
            employeeRepository.save(adminEmployee);
        }

        log.info("Database seeding / validation complete. You can login with {} / {}", adminEmail, adminPassword);
    }
}

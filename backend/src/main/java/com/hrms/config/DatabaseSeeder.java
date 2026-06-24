package com.hrms.config;

import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.security.Role;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import com.hrms.payroll.SalaryStructure;
import com.hrms.payroll.SalaryStructureRepository;
import com.hrms.attendance.OfficeLocation;
import com.hrms.attendance.OfficeLocationRepository;
import com.hrms.attendance.Attendance;
import com.hrms.attendance.AttendanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PasswordEncoder passwordEncoder;
    private final OfficeLocationRepository officeLocationRepository;
    private final AttendanceRepository attendanceRepository;

    public DatabaseSeeder(UserRepository userRepository,
                          EmployeeRepository employeeRepository,
                          SalaryStructureRepository salaryStructureRepository,
                          PasswordEncoder passwordEncoder,
                          OfficeLocationRepository officeLocationRepository,
                          AttendanceRepository attendanceRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.salaryStructureRepository = salaryStructureRepository;
        this.passwordEncoder = passwordEncoder;
        this.officeLocationRepository = officeLocationRepository;
        this.attendanceRepository = attendanceRepository;
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
        Employee adminEmployee;
        if (empOpt.isEmpty()) {
            log.info("HR Admin employee profile not found. Seeding to database...");
            adminEmployee = new Employee(
                    adminUser,
                    null,
                    "HR Administrator",
                    "Human Resources",
                    "HR Manager",
                    LocalDate.now(),
                    "ACTIVE"
            );
            adminEmployee.setId("e0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            adminEmployee = employeeRepository.save(adminEmployee);
        } else {
            adminEmployee = empOpt.get();
            adminEmployee.setEmploymentStatus("ACTIVE");
            adminEmployee = employeeRepository.save(adminEmployee);
        }

        // --- Seed Manager (Vikram Sen) ---
        String managerEmail = "manager@hrms.com";
        Optional<AppUser> mgrUserOpt = userRepository.findByEmail(managerEmail);
        AppUser managerUser;
        if (mgrUserOpt.isEmpty()) {
            log.info("Manager user not found. Seeding Vikram Sen...");
            managerUser = new AppUser(
                    managerEmail,
                    passwordEncoder.encode("password123"),
                    Role.MANAGER,
                    "ACTIVE"
            );
            managerUser.setId("m0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            managerUser = userRepository.save(managerUser);
        } else {
            managerUser = mgrUserOpt.get();
        }

        Optional<Employee> mgrEmpOpt = employeeRepository.findByUserId(managerUser.getId());
        Employee managerEmployee;
        if (mgrEmpOpt.isEmpty()) {
            managerEmployee = new Employee(
                    managerUser,
                    null,
                    "Vikram Sen",
                    "Engineering",
                    "Engineering Manager",
                    LocalDate.now().minusMonths(6),
                    "ACTIVE"
            );
            managerEmployee.setId("em0c1b2c-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            managerEmployee = employeeRepository.save(managerEmployee);

            SalaryStructure ss = new SalaryStructure(managerEmployee, new BigDecimal("120000.00"), new BigDecimal("48000.00"), new BigDecimal("8000.00"), new BigDecimal("10000.00"));
            salaryStructureRepository.save(ss);
        } else {
            managerEmployee = mgrEmpOpt.get();
        }

        // --- Seed Employee 1 (Priya Sharma) ---
        String emp1Email = "employee@hrms.com";
        Optional<AppUser> emp1UserOpt = userRepository.findByEmail(emp1Email);
        AppUser emp1User;
        if (emp1UserOpt.isEmpty()) {
            log.info("Employee user not found. Seeding Priya Sharma...");
            emp1User = new AppUser(
                    emp1Email,
                    passwordEncoder.encode("password123"),
                    Role.EMPLOYEE,
                    "ACTIVE"
            );
            emp1User.setId("ep1c1b2c-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            emp1User = userRepository.save(emp1User);
        } else {
            emp1User = emp1UserOpt.get();
        }

        Optional<Employee> emp1ProfileOpt = employeeRepository.findByUserId(emp1User.getId());
        Employee emp1Employee;
        if (emp1ProfileOpt.isEmpty()) {
            emp1Employee = new Employee(
                    emp1User,
                    managerEmployee,
                    "Priya Sharma",
                    "Engineering",
                    "Senior Developer",
                    LocalDate.now().minusMonths(3),
                    "ACTIVE"
            );
            emp1Employee.setId("ee1c1b2c-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            emp1Employee = employeeRepository.save(emp1Employee);

            SalaryStructure ss = new SalaryStructure(emp1Employee, new BigDecimal("85000.00"), new BigDecimal("34000.00"), new BigDecimal("5000.00"), new BigDecimal("6000.00"));
            salaryStructureRepository.save(ss);
        }

        // --- Seed Employee 2 (Arjun Mehta) ---
        String emp2Email = "arjun@hrms.com";
        Optional<AppUser> emp2UserOpt = userRepository.findByEmail(emp2Email);
        AppUser emp2User;
        if (emp2UserOpt.isEmpty()) {
            log.info("Employee user not found. Seeding Arjun Mehta...");
            emp2User = new AppUser(
                    emp2Email,
                    passwordEncoder.encode("password123"),
                    Role.EMPLOYEE,
                    "ACTIVE"
            );
            emp2User.setId("ep2c1b2c-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            emp2User = userRepository.save(emp2User);
        } else {
            emp2User = emp2UserOpt.get();
        }

        Optional<Employee> emp2ProfileOpt = employeeRepository.findByUserId(emp2User.getId());
        Employee emp2Employee;
        if (emp2ProfileOpt.isEmpty()) {
            emp2Employee = new Employee(
                    emp2User,
                    managerEmployee,
                    "Arjun Mehta",
                    "Design",
                    "UI/UX Designer",
                    LocalDate.now().minusMonths(4),
                    "ACTIVE"
            );
            emp2Employee.setId("ee2c1b2c-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            emp2Employee = employeeRepository.save(emp2Employee);

            SalaryStructure ss = new SalaryStructure(emp2Employee, new BigDecimal("70000.00"), new BigDecimal("28000.00"), new BigDecimal("4000.00"), new BigDecimal("5000.00"));
            salaryStructureRepository.save(ss);
        }

        // --- Seed Dummy Employee (dummyemployee@gmail.com) ---
        String dummyEmail = "dummyemployee@gmail.com";
        Optional<AppUser> dummyUserOpt = userRepository.findByEmail(dummyEmail);
        AppUser dummyUser;
        if (dummyUserOpt.isEmpty()) {
            log.info("Dummy employee user not found. Seeding dummyemployee@gmail.com...");
            dummyUser = new AppUser(
                    dummyEmail,
                    passwordEncoder.encode("password123"),
                    Role.EMPLOYEE,
                    "ACTIVE"
            );
            dummyUser.setId("d0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            dummyUser = userRepository.save(dummyUser);
        } else {
            dummyUser = dummyUserOpt.get();
        }

        Optional<Employee> dummyEmpOpt = employeeRepository.findByUserId(dummyUser.getId());
        Employee dummyEmployee;
        if (dummyEmpOpt.isEmpty()) {
            dummyEmployee = new Employee(
                    dummyUser,
                    managerEmployee,
                    "Dummy Employee",
                    "Engineering",
                    "Software Engineer",
                    LocalDate.of(2026, 3, 24),
                    "ACTIVE"
            );
            dummyEmployee.setId("de1c1b2c-d4e5-f6a7-b8c9-d0e1f2a3b4c5");
            dummyEmployee = employeeRepository.save(dummyEmployee);

            SalaryStructure ss = new SalaryStructure(dummyEmployee, new BigDecimal("50000.00"), new BigDecimal("20000.00"), new BigDecimal("3000.00"), new BigDecimal("2000.00"));
            salaryStructureRepository.save(ss);
        } else {
            dummyEmployee = dummyEmpOpt.get();
        }

        // Seed dummy attendance records for June 2026 (today is 24/06/2026) so that attendance percent is > 50%.
        int seededDaysCount = 0;
        for (int d = 1; d <= 24; d++) {
            LocalDate date = LocalDate.of(2026, 6, d);
            int dayOfWeek = date.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                // It is a weekday. Let's make the employee present on first 12 weekdays of June.
                if (seededDaysCount < 12) {
                    Optional<Attendance> attOpt = attendanceRepository.findByEmployeeIdAndDate(dummyEmployee.getId(), date);
                    if (attOpt.isEmpty()) {
                        Attendance att = new Attendance(
                                dummyEmployee,
                                date,
                                LocalTime.of(9, 0),
                                LocalTime.of(18, 0),
                                false,
                                true
                        );
                        attendanceRepository.save(att);
                    }
                    seededDaysCount++;
                }
            }
        }
        log.info("Seeded dummy attendance records for dummyemployee@gmail.com. Total present days in June: {}", seededDaysCount);

        // Update default office IP to testing IP (192.168.1.8) on system startup if it matches default value
        officeLocationRepository.findAll().stream().findFirst().ifPresent(location -> {
            if ("192.168.10.109".equals(location.getOfficeIp())) {
                log.info("Updating default office IP from 192.168.10.109 to testing IP: 192.168.1.8");
                location.setOfficeIp("192.168.1.8");
                officeLocationRepository.save(location);
            }
        });

        log.info("Database seeding / validation complete. You can login with {} / {}", adminEmail, adminPassword);
    }
}


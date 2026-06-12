package com.hrms.employee;

import com.hrms.payroll.SalaryStructure;
import com.hrms.payroll.SalaryStructureRepository;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.List;

@Service
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.mock-mail:false}")
    private boolean mockMail;

    @Value("${spring.mail.username:noreply@hrms.com}")
    private String fromAddress;

    public EmployeeService(UserRepository userRepository,
                           EmployeeRepository employeeRepository,
                           SalaryStructureRepository salaryStructureRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.salaryStructureRepository = salaryStructureRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Employee onboardEmployee(EmployeeCreateDto dto) {
        // Check if email already exists
        if (userRepository.findByEmail(dto.email().trim()).isPresent()) {
            throw new IllegalArgumentException("An account with email " + dto.email() + " already exists.");
        }

        // 1. Generate random temporary password
        String tempPassword = generateTemporaryPassword();

        // 2. Create User
        AppUser appUser = new AppUser(
                dto.email().trim(),
                passwordEncoder.encode(tempPassword),
                dto.role(),
                "PENDING"
        );
        appUser = userRepository.save(appUser);

        // 3. Find Manager
        Employee manager = null;
        if (dto.managerId() != null && !dto.managerId().trim().isEmpty()) {
            manager = employeeRepository.findById(dto.managerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found with ID: " + dto.managerId()));
        }

        // 4. Create Employee
        Employee employee = new Employee(
                appUser,
                manager,
                dto.fullName().trim(),
                dto.department().trim(),
                dto.designation().trim(),
                dto.joiningDate(),
                "PENDING"
        );
        employee = employeeRepository.save(employee);

        // 5. Create Salary Structure
        SalaryStructure salaryStructure = new SalaryStructure(
                employee,
                dto.baseSalary(),
                dto.hra(),
                dto.transportAllowance(),
                dto.otherAllowance()
        );
        salaryStructureRepository.save(salaryStructure);

        // 6. Send Onboarding Notification (Email or Console Log fallback)
        String encodedEmail = URLEncoder.encode(dto.email().trim(), StandardCharsets.UTF_8);
        String encodedTempPwd = URLEncoder.encode(tempPassword, StandardCharsets.UTF_8);
        String setupUrl = frontendUrl + "/setup-password?email=" + encodedEmail + "&tempPassword=" + encodedTempPwd;
        sendOnboardingNotification(dto.fullName().trim(), dto.email().trim(), tempPassword, setupUrl);

        org.hibernate.Hibernate.initialize(employee.getUser());
        if (employee.getManager() != null) {
            org.hibernate.Hibernate.initialize(employee.getManager());
        }

        return employee;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAllWithUserAndManager();
    }

    public List<Employee> getManagerCandidates() {
        // Find managers by role or simply list all employees since any can potentially manager
        return employeeRepository.findAll();
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private void sendOnboardingNotification(String name, String email, String tempPassword, String setupUrl) {
        String mailSubject = "Welcome to HRMS - Complete Your Account Setup";
        String mailBody = String.format(
                "Hello %s,\n\n" +
                "Welcome to HRMS! Your account has been created by the HR Admin.\n\n" +
                "Here are your login credentials:\n" +
                "Email: %s\n" +
                "Temporary Password: %s\n\n" +
                "Please click the link below to set your permanent password and activate your account:\n" +
                "%s\n\n" +
                "Best regards,\n" +
                "HR Operations Team",
                name, email, tempPassword, setupUrl
        );

        if (mockMail) {
            log.info("Mock mail enabled. Logging onboarding credentials to console...");
            printConsoleMail(email, mailSubject, mailBody);
            return;
        }

        if (mailSender != null) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
                helper.setFrom(fromAddress);
                helper.setTo(email);
                helper.setSubject(mailSubject);
                helper.setText(mailBody, false);
                mailSender.send(mimeMessage);
                log.info("Onboarding email successfully sent to: {}", email);
                return;
            } catch (Exception e) {
                log.error("Failed to send onboarding email via SMTP. Root cause: {}", getRootCauseMessage(e), e);
            }
        } else {
            log.warn("JavaMailSender bean is null — check spring.mail configuration in application.yml.");
        }

        printConsoleMail(email, mailSubject, mailBody);
    }

    private void printConsoleMail(String email, String subject, String body) {
        System.out.println("\n======================================================================");
        System.out.println("          [HRMS ONBOARDING EMAIL MOCK / FALLBACK]");
        System.out.println("======================================================================");
        System.out.println("To: " + email);
        System.out.println("Subject: " + subject);
        System.out.println("----------------------------------------------------------------------");
        System.out.println(body);
        System.out.println("======================================================================\n");
    }

    private String getRootCauseMessage(Throwable t) {
        Throwable cause = t;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause.getClass().getSimpleName() + ": " + cause.getMessage();
    }
}

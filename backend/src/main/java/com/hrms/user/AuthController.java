package com.hrms.user;

import com.hrms.common.ApiResponse;
import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, 
                          EmployeeRepository employeeRepository, 
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record LoginResponse(
            String id,
            String email,
            String role,
            String fullName,
            String employeeId
    ) {}

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized", null, java.time.Instant.now()));
        }

        String email = principal.getName();
        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Optional<Employee> employeeOpt = employeeRepository.findByUserId(appUser.getId());
        String fullName = employeeOpt.map(Employee::getFullName).orElse("System User");
        String employeeId = employeeOpt.map(Employee::getId).orElse(null);

        LoginResponse response = new LoginResponse(
                appUser.getId(),
                appUser.getEmail(),
                appUser.getRole().name(),
                fullName,
                employeeId
        );

        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    public record SetupPasswordRequest(
            String email,
            String tempPassword,
            String newPassword
    ) {}

    @PostMapping("/setup-password")
    public ResponseEntity<ApiResponse<String>> setupPassword(@RequestBody SetupPasswordRequest request) {
        if (request.email() == null || request.tempPassword() == null || request.newPassword() == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid request body parameters", null, java.time.Instant.now()));
        }

        AppUser appUser = userRepository.findByEmail(request.email().trim())
                .orElse(null);

        if (appUser == null) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "User not found", null, java.time.Instant.now()));
        }

        if (!"PENDING".equalsIgnoreCase(appUser.getStatus())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Account is not in PENDING status", null, java.time.Instant.now()));
        }

        // Verify temporary password
        if (!passwordEncoder.matches(request.tempPassword(), appUser.getPasswordHash())) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Invalid temporary password credentials", null, java.time.Instant.now()));
        }

        // Hash new password and activate user
        appUser.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        appUser.setStatus("ACTIVE");
        userRepository.save(appUser);

        // Also update corresponding employee record status to ACTIVE
        Optional<Employee> employeeOpt = employeeRepository.findByUserId(appUser.getId());
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setEmploymentStatus("ACTIVE");
            employeeRepository.save(employee);
        }

        return ResponseEntity.ok(ApiResponse.ok("Password set successfully. Your account is now active.", "ACTIVE"));
    }
}

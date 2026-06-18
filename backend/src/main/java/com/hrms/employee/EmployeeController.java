package com.hrms.employee;

import com.hrms.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final AvatarStorageService avatarStorageService;

    public EmployeeController(EmployeeService employeeService, AvatarStorageService avatarStorageService) {
        this.employeeService = employeeService;
        this.avatarStorageService = avatarStorageService;
    }

    public record EmployeeResponseDto(
            String id,
            String fullName,
            String email,
            String department,
            String designation,
            LocalDate joiningDate,
            String employmentStatus,
            String role,
            String managerId,
            String managerName
    ) {}

    public record ManagerCandidateDto(
            String id,
            String fullName,
            String designation,
            String department
    ) {}

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> onboardEmployee(@Valid @RequestBody EmployeeCreateDto dto) {
        Employee employee = employeeService.onboardEmployee(dto);
        EmployeeResponseDto response = mapToResponseDto(employee);
        return ResponseEntity.ok(ApiResponse.ok("Employee onboarded successfully.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeResponseDto>>> getAllEmployees() {
        List<EmployeeResponseDto> list = employeeService.getAllEmployees().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Employees fetched successfully", list));
    }

    @GetMapping("/managers")
    public ResponseEntity<ApiResponse<List<ManagerCandidateDto>>> getManagerCandidates() {
        List<ManagerCandidateDto> list = employeeService.getManagerCandidates().stream()
                .map(emp -> new ManagerCandidateDto(
                        emp.getId(),
                        emp.getFullName(),
                        emp.getDesignation(),
                        emp.getDepartment()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Manager candidates fetched successfully", list));
    }

    @GetMapping("/team")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDto>>> getMyTeam(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<EmployeeResponseDto> list = employeeService.getTeamEmployeesByEmail(principal.getName()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Team fetched successfully", list));
    }

    private EmployeeResponseDto mapToResponseDto(Employee emp) {
        String managerId = emp.getManager() != null ? emp.getManager().getId() : null;
        String managerName = emp.getManager() != null ? emp.getManager().getFullName() : null;
        String email = emp.getUser() != null ? emp.getUser().getEmail() : "";
        String role = emp.getUser() != null ? emp.getUser().getRole().name() : "";

        return new EmployeeResponseDto(
                emp.getId(),
                emp.getFullName(),
                email,
                emp.getDepartment(),
                emp.getDesignation(),
                emp.getJoiningDate(),
                emp.getEmploymentStatus(),
                role,
                managerId,
                managerName
        );
    }

    public record ProfileResponseDto(
            String id,
            String fullName,
            String email,
            String department,
            String designation,
            String address,
            String phoneNumber,
            String profilePic,
            String linkedinUrl,
            String bio
    ) {}

    public record ProfileUpdateRequest(
            String address,
            String phoneNumber,
            String linkedinUrl,
            String bio
    ) {}

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Employee employee = employeeService.getEmployeeByEmail(principal.getName());
        ProfileResponseDto response = new ProfileResponseDto(
                employee.getId(),
                employee.getFullName(),
                employee.getUser().getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getAddress(),
                employee.getPhoneNumber(),
                employee.getProfilePic(),
                employee.getLinkedinUrl(),
                employee.getBio()
        );
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched successfully", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> updateProfile(@RequestBody ProfileUpdateRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Employee employee = employeeService.updateProfile(
                principal.getName(),
                request.address(),
                request.phoneNumber(),
                request.linkedinUrl(),
                request.bio()
        );
        ProfileResponseDto response = new ProfileResponseDto(
                employee.getId(),
                employee.getFullName(),
                employee.getUser().getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getAddress(),
                employee.getPhoneNumber(),
                employee.getProfilePic(),
                employee.getLinkedinUrl(),
                employee.getBio()
        );
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getEmployeeById(@PathVariable String id) {
        Employee employee = employeeService.getEmployeeById(id);
        ProfileResponseDto response = new ProfileResponseDto(
                employee.getId(),
                employee.getFullName(),
                employee.getUser().getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getAddress(),
                employee.getPhoneNumber(),
                employee.getProfilePic(),
                employee.getLinkedinUrl(),
                employee.getBio()
        );
        return ResponseEntity.ok(ApiResponse.ok("Employee profile fetched successfully", response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProfileResponseDto>>> searchEmployees(@RequestParam("query") String query) {
        List<ProfileResponseDto> list = employeeService.searchEmployees(query).stream()
                .map(emp -> new ProfileResponseDto(
                        emp.getId(),
                        emp.getFullName(),
                        emp.getUser().getEmail(),
                        emp.getDepartment(),
                        emp.getDesignation(),
                        emp.getAddress(),
                        emp.getPhoneNumber(),
                        emp.getProfilePic(),
                        emp.getLinkedinUrl(),
                        emp.getBio()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Employees searched successfully", list));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(@RequestParam("file") MultipartFile file, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "File is empty", null, java.time.Instant.now()));
        }
        
        Employee employee = employeeService.getEmployeeByEmail(principal.getName());
        String oldPic = employee.getProfilePic();
        
        String fileName = avatarStorageService.storeAvatar(file);
        employeeService.updateProfilePic(principal.getName(), fileName);
        
        if (oldPic != null) {
            try {
                avatarStorageService.deleteAvatar(oldPic);
            } catch (Exception e) {
                // ignore
            }
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Avatar uploaded successfully", fileName));
    }

    @GetMapping("/profile/avatar/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getAvatar(@PathVariable String fileName, jakarta.servlet.http.HttpServletRequest request) {
        org.springframework.core.io.Resource resource = avatarStorageService.loadAvatarAsResource(fileName);
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // ignore
        }
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}


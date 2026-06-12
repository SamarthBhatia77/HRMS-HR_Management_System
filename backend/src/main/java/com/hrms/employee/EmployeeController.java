package com.hrms.employee;

import com.hrms.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
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
}

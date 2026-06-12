package com.hrms.employee;

import com.hrms.security.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeCreateDto(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Department is required")
        String department,

        @NotBlank(message = "Designation is required")
        String designation,

        @NotNull(message = "Joining date is required")
        LocalDate joiningDate,

        String managerId,

        @NotNull(message = "Role is required")
        Role role,

        @NotNull(message = "Base salary is required")
        BigDecimal baseSalary,

        BigDecimal hra,

        BigDecimal transportAllowance,

        BigDecimal otherAllowance
) {}

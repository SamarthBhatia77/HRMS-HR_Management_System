package com.hrms.payroll;

import com.hrms.common.ApiResponse;
import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.notification.Notification;
import com.hrms.notification.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Optional;

@RestController
@RequestMapping("/api/payroll")
@PreAuthorize("hasRole('HR_ADMIN')")
public class PayrollController {

    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;

    public PayrollController(SalaryStructureRepository salaryStructureRepository,
                             EmployeeRepository employeeRepository,
                             NotificationRepository notificationRepository) {
        this.salaryStructureRepository = salaryStructureRepository;
        this.employeeRepository = employeeRepository;
        this.notificationRepository = notificationRepository;
    }

    public record SalaryStructureDto(
            String id,
            String employeeId,
            BigDecimal baseSalary,
            BigDecimal hra,
            BigDecimal transportAllowance,
            BigDecimal otherAllowance
    ) {}

    public record UpdateSalaryStructureRequest(
            BigDecimal baseSalary,
            BigDecimal hra,
            BigDecimal transportAllowance,
            BigDecimal otherAllowance
    ) {}

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<SalaryStructureDto>> getSalaryStructure(@PathVariable String employeeId) {
        Optional<SalaryStructure> opt = salaryStructureRepository.findByEmployeeId(employeeId);
        if (opt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok("No salary structure found.", null));
        }
        SalaryStructure ss = opt.get();
        SalaryStructureDto dto = new SalaryStructureDto(
                ss.getId(),
                ss.getEmployee().getId(),
                ss.getBaseSalary(),
                ss.getHra(),
                ss.getTransportAllowance(),
                ss.getOtherAllowance()
        );
        return ResponseEntity.ok(ApiResponse.ok("Salary structure fetched successfully.", dto));
    }

    @PutMapping("/employee/{employeeId}")
    @Transactional
    public ResponseEntity<ApiResponse<SalaryStructureDto>> updateSalaryStructure(
            @PathVariable String employeeId,
            @RequestBody UpdateSalaryStructureRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        SalaryStructure ss = salaryStructureRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    SalaryStructure newSs = new SalaryStructure();
                    newSs.setEmployee(employee);
                    return newSs;
                });

        ss.setBaseSalary(request.baseSalary());
        ss.setHra(request.hra());
        ss.setTransportAllowance(request.transportAllowance());
        ss.setOtherAllowance(request.otherAllowance());

        ss = salaryStructureRepository.save(ss);

        // Notify the employee whose salary structure has been changed
        Notification notification = new Notification(
                employee,
                "your salary structure has been changed!",
                "PAYROLL",
                ss.getId()
        );
        notificationRepository.save(notification);

        SalaryStructureDto dto = new SalaryStructureDto(
                ss.getId(),
                ss.getEmployee().getId(),
                ss.getBaseSalary(),
                ss.getHra(),
                ss.getTransportAllowance(),
                ss.getOtherAllowance()
        );

        return ResponseEntity.ok(ApiResponse.ok("Salary structure updated successfully.", dto));
    }
}

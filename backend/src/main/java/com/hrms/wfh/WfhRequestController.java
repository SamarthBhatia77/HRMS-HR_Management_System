package com.hrms.wfh;

import com.hrms.common.ApiResponse;
import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.attendance.Attendance;
import com.hrms.attendance.AttendanceRepository;
import com.hrms.notification.Notification;
import com.hrms.notification.NotificationRepository;
import com.hrms.security.Role;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wfh")
public class WfhRequestController {

    private final WfhRequestRepository wfhRequestRepository;
    private final WfhSettingsRepository wfhSettingsRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationRepository notificationRepository;

    public WfhRequestController(WfhRequestRepository wfhRequestRepository,
                                WfhSettingsRepository wfhSettingsRepository,
                                EmployeeRepository employeeRepository,
                                UserRepository userRepository,
                                AttendanceRepository attendanceRepository,
                                NotificationRepository notificationRepository) {
        this.wfhRequestRepository = wfhRequestRepository;
        this.wfhSettingsRepository = wfhSettingsRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.notificationRepository = notificationRepository;
    }

    public record ApplyWfhDto(
            LocalDate date,
            String reason
    ) {}

    public record ReviewWfhDto(
            String remarks
    ) {}

    public record UpdateQuotaDto(
            int quota
    ) {}

    public record UpdateSettingsDto(
            int threshold
    ) {}

    public record WfhRequestDto(
            String id,
            String employeeId,
            String employeeName,
            String employeeEmail,
            String department,
            LocalDate date,
            String reason,
            String status,
            String managerRemarks,
            String hrRemarks,
            String appliedOn
    ) {}

    public record EmployeeQuotaDto(
            String id,
            String fullName,
            String email,
            String department,
            String designation,
            int wfhQuota
    ) {}

    public record WfhInfoDto(
            int wfhQuota,
            int wfhThreshold,
            long wfhUsed,
            long wfhRemaining,
            long activeRequests
    ) {}

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<WfhRequestDto>> applyWfh(Principal principal, @RequestBody ApplyWfhDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        if (dto.date().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "WFH date cannot be in the past.", null, Instant.now()));
        }

        WfhSettings settings = wfhSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> wfhSettingsRepository.save(new WfhSettings("wfh-settings-default-id-0000000000", 1)));

        // Check if user's quota is below global threshold set by HR Admin
        if (employee.getWfhQuota() < settings.getThreshold()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, 
                    "Your WFH quota (" + employee.getWfhQuota() + ") is below the minimum threshold (" + settings.getThreshold() + ") set by the HR Admin. You cannot apply for WFH.", null, Instant.now()));
        }

        // Check remaining quota in requested month
        long activeCount = wfhRequestRepository.countActiveRequestsInMonth(
                employee.getId(), dto.date().getMonthValue(), dto.date().getYear());
        if (activeCount >= employee.getWfhQuota()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, 
                    "You have reached your WFH request limit (" + employee.getWfhQuota() + ") for this month. Active requests: " + activeCount, null, Instant.now()));
        }

        String initialStatus;
        if (user.getRole() == Role.MANAGER || user.getRole() == Role.HR_ADMIN || employee.getManager() == null) {
            initialStatus = "PENDING_HR";
            // Notify HR Admin
            List<Employee> hrAdmins = employeeRepository.findHrAdmins();
            String message = String.format("Manager %s applied for WFH on %s", employee.getFullName(), dto.date());
            for (Employee hrAdmin : hrAdmins) {
                Notification notification = new Notification(hrAdmin, message, "WFH_REQUEST", "");
                notificationRepository.save(notification);
            }
        } else {
            initialStatus = "PENDING_MANAGER";
            // Notify Manager
            String message = String.format("%s applied for WFH on %s", employee.getFullName(), dto.date());
            Notification notification = new Notification(employee.getManager(), message, "WFH_REQUEST", "");
            notificationRepository.save(notification);
        }

        WfhRequest wfhRequest = new WfhRequest(employee, dto.date(), dto.reason(), initialStatus);
        wfhRequest = wfhRequestRepository.save(wfhRequest);

        return ResponseEntity.ok(ApiResponse.ok("WFH request submitted successfully.", mapToDto(wfhRequest)));
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<WfhRequestDto>>> getMyWfhRequests(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();

        List<WfhRequestDto> list = wfhRequestRepository.findByEmployeeId(employee.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("WFH history fetched successfully.", list));
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<WfhInfoDto>> getWfhInfo(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();

        WfhSettings settings = wfhSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> wfhSettingsRepository.save(new WfhSettings("wfh-settings-default-id-0000000000", 1)));

        LocalDate today = LocalDate.now();
        long activeCount = wfhRequestRepository.countActiveRequestsInMonth(employee.getId(), today.getMonthValue(), today.getYear());
        long approvedCount = wfhRequestRepository.countApprovedRequestsInMonth(employee.getId(), today.getMonthValue(), today.getYear());

        long remaining = Math.max(0, employee.getWfhQuota() - approvedCount);

        WfhInfoDto info = new WfhInfoDto(
                employee.getWfhQuota(),
                settings.getThreshold(),
                approvedCount,
                remaining,
                activeCount
        );

        return ResponseEntity.ok(ApiResponse.ok("WFH info fetched successfully.", info));
    }

    @GetMapping("/team")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<WfhRequestDto>>> getTeamWfhRequests(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee manager = employeeRepository.findByUserId(user.getId()).orElseThrow();

        List<WfhRequestDto> list = wfhRequestRepository.findPendingForManager(manager.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Team WFH requests fetched successfully.", list));
    }

    @PostMapping("/{id}/manager-review")
    @Transactional
    public ResponseEntity<ApiResponse<WfhRequestDto>> reviewWfhByManager(
            Principal principal,
            @PathVariable String id,
            @RequestParam boolean approve,
            @RequestBody(required = false) ReviewWfhDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee manager = employeeRepository.findByUserId(user.getId()).orElseThrow();

        WfhRequest request = wfhRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("WFH request not found"));

        if (request.getEmployee().getManager() == null || 
            !request.getEmployee().getManager().getId().equals(manager.getId())) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Not authorized to review this request.", null, Instant.now()));
        }

        String remarks = (dto != null) ? dto.remarks() : "";
        request.setManagerRemarks(remarks);

        if (approve) {
            request.setStatus("PENDING_HR");
            // Notify HR Admin
            List<Employee> hrAdmins = employeeRepository.findHrAdmins();
            String msg = String.format("Manager %s approved WFH for %s on %s. Pending HR final approval.",
                    manager.getFullName(), request.getEmployee().getFullName(), request.getDate());
            for (Employee hrAdmin : hrAdmins) {
                Notification notification = new Notification(hrAdmin, msg, "WFH_REQUEST", request.getId());
                notificationRepository.save(notification);
            }
        } else {
            request.setStatus("REJECTED");
            // Notify Employee
            String msg = String.format("Your WFH request for %s has been REJECTED by manager %s. Remarks: %s",
                    request.getDate(), manager.getFullName(), remarks);
            Notification notification = new Notification(request.getEmployee(), msg, "WFH_REQUEST", request.getId());
            notificationRepository.save(notification);
        }

        request = wfhRequestRepository.save(request);
        return ResponseEntity.ok(ApiResponse.ok("WFH request reviewed by manager.", mapToDto(request)));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<WfhRequestDto>>> getPendingForHr(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<WfhRequestDto> list = wfhRequestRepository.findPendingForHr().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Pending WFH requests fetched for HR Admin.", list));
    }

    @PostMapping("/{id}/hr-review")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<WfhRequestDto>> reviewWfhByHr(
            Principal principal,
            @PathVariable String id,
            @RequestParam boolean approve,
            @RequestBody(required = false) ReviewWfhDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        WfhRequest wfhRequest = wfhRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("WFH request not found"));

        String remarks = (dto != null) ? dto.remarks() : "";
        wfhRequest.setHrRemarks(remarks);

        if (approve) {
            wfhRequest.setStatus("APPROVED");

            // Mark user as Present on that date in Attendance database regardless of checkin/checkout
            LocalDate date = wfhRequest.getDate();
            Employee employee = wfhRequest.getEmployee();
            Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), date)
                    .orElse(new Attendance(employee, date, null, null, false, false));

            attendance.setWfh(true);
            attendance.setLate(false);
            attendance.setOvertime(false);
            if (attendance.getCheckIn() == null) {
                attendance.setCheckIn(LocalTime.of(9, 0, 0));
            }
            if (attendance.getCheckOut() == null) {
                attendance.setCheckOut(LocalTime.of(17, 0, 0));
            }
            attendanceRepository.save(attendance);

            // Notify Employee
            String msg = String.format("Your WFH request for %s has been APPROVED by HR Admin. Remarks: %s",
                    date, remarks);
            Notification notification = new Notification(employee, msg, "WFH_REQUEST", wfhRequest.getId());
            notificationRepository.save(notification);
        } else {
            wfhRequest.setStatus("REJECTED");
            // Notify Employee
            String msg = String.format("Your WFH request for %s has been REJECTED by HR Admin. Remarks: %s",
                    wfhRequest.getDate(), remarks);
            Notification notification = new Notification(wfhRequest.getEmployee(), msg, "WFH_REQUEST", wfhRequest.getId());
            notificationRepository.save(notification);
        }

        wfhRequest = wfhRequestRepository.save(wfhRequest);
        return ResponseEntity.ok(ApiResponse.ok("WFH request reviewed by HR Admin.", mapToDto(wfhRequest)));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<WfhSettings>> getWfhSettings(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        WfhSettings settings = wfhSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> wfhSettingsRepository.save(new WfhSettings("wfh-settings-default-id-0000000000", 1)));
        return ResponseEntity.ok(ApiResponse.ok("WFH settings fetched successfully.", settings));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<WfhSettings>> updateWfhSettings(Principal principal, @RequestBody UpdateSettingsDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        WfhSettings settings = wfhSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> new WfhSettings("wfh-settings-default-id-0000000000", 1));
        settings.setThreshold(dto.threshold());
        settings = wfhSettingsRepository.save(settings);
        return ResponseEntity.ok(ApiResponse.ok("WFH global threshold updated successfully.", settings));
    }

    @GetMapping("/admin/employees")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<List<EmployeeQuotaDto>>> getEmployeesForQuota(
            Principal principal,
            @RequestParam(required = false, defaultValue = "") String query) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        List<Employee> list;
        if (query.trim().isEmpty()) {
            list = employeeRepository.findAllWithUserAndManager();
        } else {
            list = employeeRepository.searchEmployees(query);
        }

        List<EmployeeQuotaDto> dtos = list.stream()
                .map(e -> new EmployeeQuotaDto(
                        e.getId(),
                        e.getFullName(),
                        e.getUser().getEmail(),
                        e.getDepartment(),
                        e.getDesignation(),
                        e.getWfhQuota()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Employees fetched for WFH quota setting.", dtos));
    }

    @PutMapping("/admin/employees/{id}/quota")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<EmployeeQuotaDto>> updateEmployeeQuota(
            Principal principal,
            @PathVariable String id,
            @RequestBody UpdateQuotaDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found."));
        employee.setWfhQuota(dto.quota());
        employee = employeeRepository.save(employee);

        EmployeeQuotaDto resDto = new EmployeeQuotaDto(
                employee.getId(),
                employee.getFullName(),
                employee.getUser().getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getWfhQuota()
        );

        return ResponseEntity.ok(ApiResponse.ok("Employee WFH quota updated successfully.", resDto));
    }

    private WfhRequestDto mapToDto(WfhRequest w) {
        return new WfhRequestDto(
                w.getId(),
                w.getEmployee().getId(),
                w.getEmployee().getFullName(),
                w.getEmployee().getUser().getEmail(),
                w.getEmployee().getDepartment(),
                w.getDate(),
                w.getReason(),
                w.getStatus(),
                w.getManagerRemarks(),
                w.getHrRemarks(),
                w.getCreatedAt().toString().split("T")[0]
        );
    }

    @GetMapping("/test-debug")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Object>> testDebug() {
        List<String> employeeInfo = employeeRepository.findAllWithUserAndManager().stream()
                .map(e -> "ID=" + e.getId() + ", Name=" + e.getFullName() + ", Email=" + e.getUser().getEmail() + ", Quota=" + e.getWfhQuota() + ", ManagerId=" + (e.getManager() != null ? e.getManager().getId() : "null"))
                .collect(Collectors.toList());
        List<String> requestInfo = wfhRequestRepository.findAllWithEmployee().stream()
                .map(r -> "ID=" + r.getId() + ", Employee=" + r.getEmployee().getFullName() + ", Date=" + r.getDate() + ", Status=" + r.getStatus())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Debug Info", List.of(employeeInfo, requestInfo)));
    }
}

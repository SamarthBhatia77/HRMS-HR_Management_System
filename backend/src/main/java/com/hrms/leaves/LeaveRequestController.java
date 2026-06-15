package com.hrms.leaves;

import com.hrms.common.ApiResponse;
import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.notification.Notification;
import com.hrms.notification.NotificationRepository;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public LeaveRequestController(LeaveRequestRepository leaveRequestRepository,
                                  EmployeeRepository employeeRepository,
                                  UserRepository userRepository,
                                  NotificationRepository notificationRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    public record LeaveRequestDto(
            String id,
            String employeeId,
            String employeeName,
            String leaveType,
            LocalDate startDate,
            LocalDate endDate,
            String reason,
            String status,
            String appliedOn
    ) {}

    public record ApplyLeaveDto(
            String leaveType,
            LocalDate startDate,
            LocalDate endDate,
            String reason
    ) {}

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<LeaveRequestDto>> applyLeave(Principal principal, @RequestBody ApplyLeaveDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        if (dto.startDate().isAfter(dto.endDate())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Start date must be before or equal to end date", null, java.time.Instant.now()));
        }

        LeaveRequest leaveRequest = new LeaveRequest(
                employee,
                dto.leaveType(),
                dto.startDate(),
                dto.endDate(),
                dto.reason(),
                "PENDING"
        );
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Generate notification for manager
        if (employee.getManager() != null) {
            String message = String.format("%s applied for %s from %s to %s",
                    employee.getFullName(), dto.leaveType(), dto.startDate(), dto.endDate());
            Notification notification = new Notification(
                    employee.getManager(),
                    message,
                    "LEAVE_REQUEST",
                    leaveRequest.getId()
            );
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok(ApiResponse.ok("Leave request submitted successfully.", mapToDto(leaveRequest)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getMyLeaves(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();

        List<LeaveRequestDto> list = leaveRequestRepository.findByEmployeeId(employee.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Leaves fetched successfully.", list));
    }

    @GetMapping("/team")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getTeamLeaves(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee manager = employeeRepository.findByUserId(user.getId()).orElseThrow();

        List<LeaveRequestDto> list = leaveRequestRepository.findByManagerId(manager.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Team leaves fetched successfully.", list));
    }

    @PostMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<ApiResponse<LeaveRequestDto>> approveLeave(Principal principal, @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee manager = employeeRepository.findByUserId(user.getId()).orElseThrow();

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        // Verify manager authorization
        if (leaveRequest.getEmployee().getManager() == null || 
            !leaveRequest.getEmployee().getManager().getId().equals(manager.getId())) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "You are not authorized to approve this leave request", null, java.time.Instant.now()));
        }

        leaveRequest.setStatus("APPROVED");
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Notify employee
        Notification notification = new Notification(
                leaveRequest.getEmployee(),
                String.format("Your leave request for %s to %s has been APPROVED", leaveRequest.getStartDate(), leaveRequest.getEndDate()),
                "LEAVE_REQUEST",
                leaveRequest.getId()
        );
        notificationRepository.save(notification);

        return ResponseEntity.ok(ApiResponse.ok("Leave request approved.", mapToDto(leaveRequest)));
    }

    @PostMapping("/{id}/reject")
    @Transactional
    public ResponseEntity<ApiResponse<LeaveRequestDto>> rejectLeave(Principal principal, @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee manager = employeeRepository.findByUserId(user.getId()).orElseThrow();

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        // Verify manager authorization
        if (leaveRequest.getEmployee().getManager() == null || 
            !leaveRequest.getEmployee().getManager().getId().equals(manager.getId())) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "You are not authorized to reject this leave request", null, java.time.Instant.now()));
        }

        leaveRequest.setStatus("REJECTED");
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Notify employee
        Notification notification = new Notification(
                leaveRequest.getEmployee(),
                String.format("Your leave request for %s to %s has been REJECTED", leaveRequest.getStartDate(), leaveRequest.getEndDate()),
                "LEAVE_REQUEST",
                leaveRequest.getId()
        );
        notificationRepository.save(notification);

        return ResponseEntity.ok(ApiResponse.ok("Leave request rejected.", mapToDto(leaveRequest)));
    }

    private LeaveRequestDto mapToDto(LeaveRequest lr) {
        return new LeaveRequestDto(
                lr.getId(),
                lr.getEmployee().getId(),
                lr.getEmployee().getFullName(),
                lr.getLeaveType(),
                lr.getStartDate(),
                lr.getEndDate(),
                lr.getReason(),
                lr.getStatus(),
                lr.getCreatedAt().toString().split("T")[0]
        );
    }
}

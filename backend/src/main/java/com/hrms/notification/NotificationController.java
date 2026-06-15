package com.hrms.notification;

import com.hrms.common.ApiResponse;
import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository,
                                  EmployeeRepository employeeRepository,
                                  UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    public record NotificationDto(
            String id,
            String message,
            String type,
            String relatedId,
            boolean isRead,
            String createdAt
    ) {}

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();

        List<NotificationDto> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(employee.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Notifications fetched successfully.", list));
    }

    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> markAsRead(Principal principal, @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getRecipient().getId().equals(employee.getId())) {
            return ResponseEntity.status(403).build();
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read.", null));
    }

    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();

        notificationRepository.markAllAsRead(employee.getId());

        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read.", null));
    }

    private NotificationDto mapToDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getMessage(),
                n.getType(),
                n.getRelatedId(),
                n.isRead(),
                n.getCreatedAt().toString()
        );
    }
}

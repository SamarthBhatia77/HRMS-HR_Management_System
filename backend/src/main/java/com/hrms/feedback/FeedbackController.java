package com.hrms.feedback;

import com.hrms.common.ApiResponse;
import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.notification.Notification;
import com.hrms.notification.NotificationRepository;
import com.hrms.security.Role;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public FeedbackController(FeedbackRepository feedbackRepository,
                              EmployeeRepository employeeRepository,
                              UserRepository userRepository,
                              NotificationRepository notificationRepository) {
        this.feedbackRepository = feedbackRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    public record FeedbackDto(
            String id,
            String employeeId,
            String employeeName,
            String category,
            String title,
            String details,
            int rating,
            boolean anonymous,
            String submittedOn
    ) {}

    public record SubmitFeedbackDto(
            String category,
            String title,
            String details,
            int rating,
            boolean anonymous
    ) {}

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<FeedbackDto>> submitFeedback(Principal principal, @RequestBody SubmitFeedbackDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();

        Feedback feedback = new Feedback(
                employee,
                dto.category(),
                dto.title(),
                dto.details(),
                dto.rating(),
                dto.anonymous()
        );
        feedback = feedbackRepository.save(feedback);

        String authorLabel = dto.anonymous() ? "Anonymous" : employee.getFullName();
        String message = String.format("New feedback submitted by %s in %s", authorLabel, dto.category());

        // 1. Notify Manager
        if (employee.getManager() != null) {
            Notification mgrNotification = new Notification(
                    employee.getManager(),
                    message,
                    "FEEDBACK",
                    feedback.getId()
            );
            notificationRepository.save(mgrNotification);
        }

        // 2. Notify all HR Admins
        List<Employee> hrAdmins = employeeRepository.findHrAdmins();
        for (Employee hrAdmin : hrAdmins) {
            // Avoid duplicate notification if the manager is also an HR Admin (rare but possible)
            if (employee.getManager() == null || !hrAdmin.getId().equals(employee.getManager().getId())) {
                Notification hrNotification = new Notification(
                        hrAdmin,
                        message,
                        "FEEDBACK",
                        feedback.getId()
                );
                notificationRepository.save(hrNotification);
            }
        }

        return ResponseEntity.ok(ApiResponse.ok("Feedback submitted successfully.", mapToDto(feedback, false)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getFeedback(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Employee currentEmp = employeeRepository.findByUserId(user.getId()).orElseThrow();

        List<FeedbackDto> result;

        if (user.getRole() == Role.HR_ADMIN) {
            // HR Admin gets ALL feedback (redacted if anonymous)
            result = feedbackRepository.findAllFetched().stream()
                    .map(fb -> mapToDto(fb, fb.isAnonymous()))
                    .collect(Collectors.toList());
        } else if (user.getRole() == Role.MANAGER) {
            // Manager gets feedback of reports (redacted if anonymous)
            result = feedbackRepository.findByManagerId(currentEmp.getId()).stream()
                    .map(fb -> mapToDto(fb, fb.isAnonymous()))
                    .collect(Collectors.toList());
        } else {
            // Employee gets only their own feedbacks (full details)
            result = feedbackRepository.findByEmployeeId(currentEmp.getId()).stream()
                    .map(fb -> mapToDto(fb, false))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.ok("Feedback fetched successfully.", result));
    }

    private FeedbackDto mapToDto(Feedback fb, boolean redactAuthor) {
        String employeeId = redactAuthor ? null : fb.getEmployee().getId();
        String employeeName = redactAuthor ? "Anonymous" : fb.getEmployee().getFullName();

        return new FeedbackDto(
                fb.getId(),
                employeeId,
                employeeName,
                fb.getCategory(),
                fb.getTitle(),
                fb.getDetails(),
                fb.getRating(),
                fb.isAnonymous(),
                fb.getCreatedAt().toString().split("T")[0]
        );
    }
}

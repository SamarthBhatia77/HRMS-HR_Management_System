package com.hrms.attendance;

import com.hrms.common.ApiResponse;
import com.hrms.user.AppUser;
import com.hrms.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceService attendanceService, UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    public record MarkAttendanceDto(
            double latitude,
            double longitude
    ) {}

    public record UpdateLocationDto(
            double latitude,
            double longitude,
            double radiusMeters,
            String address,
            String officeIp
    ) {}

    public record AttendanceResponseDto(
            String id,
            String employeeId,
            String employeeName,
            LocalDate date,
            String checkIn,
            String checkOut,
            boolean late,
            boolean overtime,
            boolean wfh
    ) {}

    public record OfficeLocationResponseDto(
            String id,
            double latitude,
            double longitude,
            double radiusMeters,
            String address,
            String officeIp
    ) {}

    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> markAttendance(Principal principal, HttpServletRequest request, @RequestBody MarkAttendanceDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        String clientIp = getClientIp(request);
        Attendance attendance = attendanceService.markAttendance(user.getId(), dto.latitude(), dto.longitude(), clientIp);
        return ResponseEntity.ok(ApiResponse.ok("Attendance marked successfully.", mapToDto(attendance)));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> getTodayAttendance(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return attendanceService.getTodayAttendance(user.getId())
                .map(attendance -> ResponseEntity.ok(ApiResponse.ok("Today's attendance fetched.", mapToDto(attendance))))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.ok("No check-in record for today yet.", null)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AttendanceResponseDto>>> getMonthlyAttendance(
            Principal principal,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        int activeMonth = (month != null) ? month : LocalDate.now().getMonthValue();
        int activeYear = (year != null) ? year : LocalDate.now().getYear();

        List<AttendanceResponseDto> list = attendanceService.getMonthlyAttendance(user.getId(), activeMonth, activeYear).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Monthly attendance fetched successfully.", list));
    }

    @GetMapping("/location")
    public ResponseEntity<ApiResponse<OfficeLocationResponseDto>> getOfficeLocation(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        OfficeLocation location = attendanceService.getOfficeLocation();
        return ResponseEntity.ok(ApiResponse.ok("Office location fetched.", mapToOfficeDto(location)));
    }

    @PutMapping("/location")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<OfficeLocationResponseDto>> updateOfficeLocation(Principal principal, @RequestBody UpdateLocationDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        OfficeLocation location = attendanceService.updateOfficeLocation(dto.latitude(), dto.longitude(), dto.radiusMeters(), dto.address(), dto.officeIp());
        return ResponseEntity.ok(ApiResponse.ok("Office location updated successfully.", mapToOfficeDto(location)));
    }

    private AttendanceResponseDto mapToDto(Attendance a) {
        if (a == null) return null;
        String checkInStr = a.getCheckIn() != null ? a.getCheckIn().toString().substring(0, 8) : null;
        String checkOutStr = a.getCheckOut() != null ? a.getCheckOut().toString().substring(0, 8) : null;
        return new AttendanceResponseDto(
                a.getId(),
                a.getEmployee().getId(),
                a.getEmployee().getFullName(),
                a.getDate(),
                checkInStr,
                checkOutStr,
                a.isLate(),
                a.isOvertime(),
                a.isWfh()
        );
    }

    private OfficeLocationResponseDto mapToOfficeDto(OfficeLocation o) {
        if (o == null) return null;
        return new OfficeLocationResponseDto(
                o.getId(),
                o.getLatitude(),
                o.getLongitude(),
                o.getRadiusMeters(),
                o.getAddress(),
                o.getOfficeIp()
        );
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }
}

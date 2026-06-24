package com.hrms.attendance;

import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.notification.Notification;
import com.hrms.notification.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final OfficeLocationRepository officeLocationRepository;
    private final NotificationRepository notificationRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository,
                             OfficeLocationRepository officeLocationRepository,
                             NotificationRepository notificationRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.officeLocationRepository = officeLocationRepository;
        this.notificationRepository = notificationRepository;
    }

    public OfficeLocation getOfficeLocation() {
        return officeLocationRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Office location is not configured in the system."));
    }

    @Transactional
    public OfficeLocation updateOfficeLocation(double latitude, double longitude, double radiusMeters, String address, String officeIp) {
        OfficeLocation location;
        List<OfficeLocation> list = officeLocationRepository.findAll();
        if (list.isEmpty()) {
            location = new OfficeLocation(latitude, longitude, radiusMeters, address);
            location.setOfficeIp(officeIp);
        } else {
            location = list.get(0);
            location.setLatitude(latitude);
            location.setLongitude(longitude);
            location.setRadiusMeters(radiusMeters);
            location.setAddress(address);
            location.setOfficeIp(officeIp);
        }
        return officeLocationRepository.save(location);
    }

    @Transactional
    public Attendance markAttendance(String userId, double userLat, double userLng, String clientIp) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found for user: " + userId));

        OfficeLocation office = getOfficeLocation();

        // Verify client IP address (mandatory)
        String officeIp = office.getOfficeIp();
        if (officeIp == null || officeIp.trim().isEmpty()) {
            throw new IllegalArgumentException("IP verification failed! Office WiFi IP is not configured in the system.");
        }

        String resolvedClientIp = clientIp != null ? clientIp.trim() : "";
        if (!officeIp.equalsIgnoreCase(resolvedClientIp)) {
            throw new IllegalArgumentException("IP verification failed! Your request IP (" + resolvedClientIp + ") does not match the configured office IP (" + officeIp + ").");
        }

        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        Optional<Attendance> existingOpt = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today);

        if (existingOpt.isEmpty()) {
            // Check-in logic
            boolean isLate = nowTime.isAfter(LocalTime.of(10, 15));
            Attendance attendance = new Attendance(employee, today, nowTime, null, isLate, false);
            attendance = attendanceRepository.save(attendance);

            if (isLate && employee.getManager() != null) {
                String msg = String.format("%s checked in late at %s.", 
                        employee.getFullName(), nowTime.format(DateTimeFormatter.ofPattern("hh:mm a")));
                Notification notification = new Notification(
                        employee.getManager(),
                        msg,
                        "ATTENDANCE",
                        attendance.getId()
                );
                notificationRepository.save(notification);
            }
            return attendance;
        } else {
            Attendance attendance = existingOpt.get();
            if (attendance.getCheckOut() != null) {
                throw new IllegalStateException("You have already checked out for today.");
            }

            // Check-out logic
            boolean isOvertime = nowTime.isAfter(LocalTime.of(17, 45)); // 5:45 PM
            attendance.setCheckOut(nowTime);
            attendance.setOvertime(isOvertime);
            attendance = attendanceRepository.save(attendance);

            if (isOvertime && employee.getManager() != null) {
                String msg = String.format("%s checked out with overtime at %s.", 
                        employee.getFullName(), nowTime.format(DateTimeFormatter.ofPattern("hh:mm a")));
                Notification notification = new Notification(
                        employee.getManager(),
                        msg,
                        "ATTENDANCE",
                        attendance.getId()
                );
                notificationRepository.save(notification);
            }
            return attendance;
        }
    }

    public Optional<Attendance> getTodayAttendance(String userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found for user: " + userId));
        return attendanceRepository.findByEmployeeIdAndDate(employee.getId(), LocalDate.now());
    }

    public List<Attendance> getMonthlyAttendance(String userId, int month, int year) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found for user: " + userId));
        return attendanceRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), month, year);
    }

    public List<Attendance> getEmployeeMonthlyAttendance(String employeeId, int month, int year) {
        return attendanceRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371000; // meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}

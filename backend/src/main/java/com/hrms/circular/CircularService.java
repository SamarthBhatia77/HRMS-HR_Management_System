package com.hrms.circular;

import com.hrms.employee.Employee;
import com.hrms.employee.EmployeeRepository;
import com.hrms.notification.Notification;
import com.hrms.notification.NotificationRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class CircularService {

    private final CircularRepository circularRepository;
    private final FileStorageService fileStorageService;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;

    public CircularService(CircularRepository circularRepository,
                           FileStorageService fileStorageService,
                           EmployeeRepository employeeRepository,
                           NotificationRepository notificationRepository) {
        this.circularRepository = circularRepository;
        this.fileStorageService = fileStorageService;
        this.employeeRepository = employeeRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Circular createCircular(String title, String description, MultipartFile file) {
        // Save the file physically
        String fileName = fileStorageService.storeFile(file);

        // Save metadata in database
        Circular circular = new Circular(
                title.trim(),
                description != null ? description.trim() : null,
                fileName,
                file.getOriginalFilename()
        );
        circular = circularRepository.save(circular);

        // Dispatch notifications to all employees (both standard employees and managers)
        List<Employee> allEmployees = employeeRepository.findAll();
        for (Employee emp : allEmployees) {
            String message = String.format("New circular published: %s", circular.getTitle());
            Notification notification = new Notification(
                    emp,
                    message,
                    "CIRCULAR",
                    circular.getId()
            );
            notificationRepository.save(notification);
        }

        return circular;
    }

    public List<Circular> getAllCirculars() {
        return circularRepository.findAll();
    }

    public Circular getCircularById(String id) {
        return circularRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Circular not found with ID: " + id));
    }

    public Resource getCircularFile(String id) {
        Circular circular = getCircularById(id);
        return fileStorageService.loadFileAsResource(circular.getFileName());
    }

    @Transactional
    public void deleteCircular(String id) {
        Circular circular = getCircularById(id);
        
        // Remove file physically
        fileStorageService.deleteFile(circular.getFileName());
        
        // Delete database entry
        circularRepository.delete(circular);
    }
}

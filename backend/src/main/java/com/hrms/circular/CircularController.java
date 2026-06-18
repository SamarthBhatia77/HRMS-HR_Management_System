package com.hrms.circular;

import com.hrms.common.ApiResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/circulars")
public class CircularController {

    private final CircularService circularService;

    public CircularController(CircularService circularService) {
        this.circularService = circularService;
    }

    public record CircularResponseDto(
            String id,
            String title,
            String description,
            String originalName,
            String uploadedAt
    ) {}

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<CircularResponseDto>> uploadCircular(
            Principal principal,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {
        
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "File cannot be empty.", null, java.time.Instant.now()));
        }

        Circular circular = circularService.createCircular(title, description, file);
        return ResponseEntity.ok(ApiResponse.ok("Circular uploaded and published successfully.", mapToDto(circular)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CircularResponseDto>>> getAllCirculars(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<CircularResponseDto> list = circularService.getAllCirculars().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Circulars fetched successfully.", list));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadCircular(Principal principal, @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Circular circular = circularService.getCircularById(id);
        Resource resource = circularService.getCircularFile(id);

        String contentType = "application/pdf"; // Defaulting to PDF

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + circular.getOriginalName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteCircular(Principal principal, @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        circularService.deleteCircular(id);
        return ResponseEntity.ok(ApiResponse.ok("Circular deleted successfully.", id));
    }

    private CircularResponseDto mapToDto(Circular c) {
        return new CircularResponseDto(
                c.getId(),
                c.getTitle(),
                c.getDescription(),
                c.getOriginalName(),
                c.getCreatedAt().toString().split("T")[0]
        );
    }
}

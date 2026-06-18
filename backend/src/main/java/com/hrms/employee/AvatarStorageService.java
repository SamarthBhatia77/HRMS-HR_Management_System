package com.hrms.employee;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class AvatarStorageService {

    private final Path avatarStorageLocation;

    public AvatarStorageService() {
        this.avatarStorageLocation = Paths.get("uploads/avatars")
                .toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.avatarStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for storing avatar images.", ex);
        }
    }

    public String storeAvatar(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        try {
            if (originalFileName.contains("..")) {
                throw new IllegalArgumentException("Filename contains invalid path sequence " + originalFileName);
            }

            // Generate unique filename with original extension
            String fileExtension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                fileExtension = originalFileName.substring(i);
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = this.avatarStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store avatar file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Resource loadAvatarAsResource(String fileName) {
        try {
            Path filePath = this.avatarStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Avatar file not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Avatar file not found: " + fileName, ex);
        }
    }

    public void deleteAvatar(String fileName) {
        try {
            Path filePath = this.avatarStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete avatar file: " + fileName, ex);
        }
    }
}

package com.hrms.wfh;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "wfh_settings")
public class WfhSettings {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)", nullable = false)
    private String id;

    @Column(name = "threshold", nullable = false)
    private int threshold = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public WfhSettings() {}

    public WfhSettings(String id, int threshold) {
        this.id = id;
        this.threshold = threshold;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getThreshold() {
        return threshold;
    }

    public void setThreshold(int threshold) {
        this.threshold = threshold;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

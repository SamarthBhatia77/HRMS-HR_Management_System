package com.hrms.wfh;

import com.hrms.employee.Employee;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "wfh_request", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "date"})
})
public class WfhRequest {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", columnDefinition = "CHAR(36)", nullable = false)
    private Employee employee;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false, length = 40)
    private String status; // PENDING_MANAGER, PENDING_HR, APPROVED, REJECTED

    @Column(name = "manager_remarks")
    private String managerRemarks;

    @Column(name = "hr_remarks")
    private String hrRemarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public WfhRequest() {}

    public WfhRequest(Employee employee, LocalDate date, String reason, String status) {
        this.employee = employee;
        this.date = date;
        this.reason = reason;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getManagerRemarks() {
        return managerRemarks;
    }

    public void setManagerRemarks(String managerRemarks) {
        this.managerRemarks = managerRemarks;
    }

    public String getHrRemarks() {
        return hrRemarks;
    }

    public void setHrRemarks(String hrRemarks) {
        this.hrRemarks = hrRemarks;
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

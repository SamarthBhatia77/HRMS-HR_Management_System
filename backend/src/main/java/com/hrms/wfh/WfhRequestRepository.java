package com.hrms.wfh;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WfhRequestRepository extends JpaRepository<WfhRequest, String> {

    @Query("SELECT w FROM WfhRequest w LEFT JOIN FETCH w.employee e WHERE e.id = :employeeId ORDER BY w.date DESC")
    List<WfhRequest> findByEmployeeId(@Param("employeeId") String employeeId);

    @Query("SELECT w FROM WfhRequest w LEFT JOIN FETCH w.employee e LEFT JOIN FETCH e.manager m WHERE m.id = :managerId AND w.status = 'PENDING_MANAGER' ORDER BY w.date ASC")
    List<WfhRequest> findPendingForManager(@Param("managerId") String managerId);

    @Query("SELECT w FROM WfhRequest w LEFT JOIN FETCH w.employee e WHERE w.status = 'PENDING_HR' ORDER BY w.date ASC")
    List<WfhRequest> findPendingForHr();

    @Query("SELECT w FROM WfhRequest w LEFT JOIN FETCH w.employee e ORDER BY w.date DESC")
    List<WfhRequest> findAllWithEmployee();

    @Query("SELECT COUNT(w) FROM WfhRequest w WHERE w.employee.id = :employeeId AND YEAR(w.date) = :year AND MONTH(w.date) = :month AND w.status != 'REJECTED'")
    long countActiveRequestsInMonth(
            @Param("employeeId") String employeeId,
            @Param("month") int month,
            @Param("year") int year
    );

    @Query("SELECT COUNT(w) FROM WfhRequest w WHERE w.employee.id = :employeeId AND YEAR(w.date) = :year AND MONTH(w.date) = :month AND w.status = 'APPROVED'")
    long countApprovedRequestsInMonth(
            @Param("employeeId") String employeeId,
            @Param("month") int month,
            @Param("year") int year
    );
}

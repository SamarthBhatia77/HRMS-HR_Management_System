package com.hrms.leaves;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {

    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee e WHERE e.id = :employeeId ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByEmployeeId(@Param("employeeId") String employeeId);

    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee e WHERE e.manager.id = :managerId ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByManagerId(@Param("managerId") String managerId);
}

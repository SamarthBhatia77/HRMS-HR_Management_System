package com.hrms.feedback;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, String> {

    @Query("SELECT f FROM Feedback f JOIN FETCH f.employee e WHERE e.id = :employeeId ORDER BY f.createdAt DESC")
    List<Feedback> findByEmployeeId(@Param("employeeId") String employeeId);

    @Query("SELECT f FROM Feedback f JOIN FETCH f.employee e WHERE e.manager.id = :managerId ORDER BY f.createdAt DESC")
    List<Feedback> findByManagerId(@Param("managerId") String managerId);

    @Query("SELECT f FROM Feedback f JOIN FETCH f.employee e ORDER BY f.createdAt DESC")
    List<Feedback> findAllFetched();
}

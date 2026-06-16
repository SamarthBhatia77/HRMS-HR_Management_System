package com.hrms.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee e LEFT JOIN FETCH e.user WHERE e.id = :employeeId AND a.date = :date")
    Optional<Attendance> findByEmployeeIdAndDate(@Param("employeeId") String employeeId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee e WHERE e.id = :employeeId AND YEAR(a.date) = :year AND MONTH(a.date) = :month ORDER BY a.date ASC")
    List<Attendance> findByEmployeeIdAndMonthAndYear(@Param("employeeId") String employeeId, @Param("month") int month, @Param("year") int year);
}

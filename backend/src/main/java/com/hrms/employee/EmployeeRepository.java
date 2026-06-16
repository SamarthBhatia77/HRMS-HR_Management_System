package com.hrms.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.user LEFT JOIN FETCH e.manager WHERE e.manager.id = :managerId")
    List<Employee> findByManagerId(@Param("managerId") String managerId);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.user LEFT JOIN FETCH e.manager WHERE e.user.id = :userId")
    Optional<Employee> findByUserId(@Param("userId") String userId);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.user LEFT JOIN FETCH e.manager")
    List<Employee> findAllWithUserAndManager();

    @Query("SELECT e FROM Employee e JOIN FETCH e.user u WHERE u.role = com.hrms.security.Role.HR_ADMIN")
    List<Employee> findHrAdmins();
}


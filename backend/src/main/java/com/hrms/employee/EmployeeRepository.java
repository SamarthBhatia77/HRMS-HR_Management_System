package com.hrms.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    List<Employee> findByManagerId(String managerId);
    Optional<Employee> findByUserId(String userId);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Employee e LEFT JOIN FETCH e.user LEFT JOIN FETCH e.manager")
    List<Employee> findAllWithUserAndManager();
}

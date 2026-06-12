package com.hrms.payroll;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, String> {
    Optional<SalaryStructure> findByEmployeeId(String employeeId);
}

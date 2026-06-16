package com.hrms.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficeLocationRepository extends JpaRepository<OfficeLocation, String> {
}

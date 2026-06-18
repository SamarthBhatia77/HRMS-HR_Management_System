package com.hrms.circular;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CircularRepository extends JpaRepository<Circular, String> {
}

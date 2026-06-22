package com.hrms.wfh;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WfhSettingsRepository extends JpaRepository<WfhSettings, String> {
}

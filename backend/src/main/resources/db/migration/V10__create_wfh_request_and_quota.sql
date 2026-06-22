ALTER TABLE employee ADD COLUMN wfh_quota INT NOT NULL DEFAULT 5;

ALTER TABLE attendance ADD COLUMN is_wfh BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE wfh_settings (
    id CHAR(36) PRIMARY KEY,
    threshold INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO wfh_settings (id, threshold, created_at, updated_at)
VALUES ('wfh-settings-default-id-0000000000', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE wfh_request (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(40) NOT NULL,
    manager_remarks VARCHAR(255) NULL,
    hr_remarks VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_wfh_employee FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT uq_wfh_employee_date UNIQUE (employee_id, date)
);

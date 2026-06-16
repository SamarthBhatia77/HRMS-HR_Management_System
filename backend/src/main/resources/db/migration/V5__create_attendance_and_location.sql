CREATE TABLE office_location (
    id CHAR(36) PRIMARY KEY,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    radius_meters DOUBLE NOT NULL,
    address VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE attendance (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    check_in TIME NULL,
    check_out TIME NULL,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    is_overtime BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_date UNIQUE (employee_id, date)
);

INSERT INTO office_location (id, latitude, longitude, radius_meters, address, created_at, updated_at)
VALUES (
    'loc-default-id-0000000000000000000',
    28.5675,
    77.3162,
    200.0,
    'Plot 15 & 16, Film City, Sector 16A, Noida (Express Corporate Park / Express Trade Tower-1)',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

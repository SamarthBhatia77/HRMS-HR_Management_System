CREATE TABLE salary_structure (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL UNIQUE,
    base_salary DECIMAL(12,2) NOT NULL,
    hra DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    transport_allowance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    other_allowance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_salary_employee FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

-- Seed a dummy HR Admin in app_user
-- Email: admin@hrms.com
-- Password: admin123
-- Password hash: BCrypt hash of admin123
-- Role: HR_ADMIN
-- Status: ACTIVE
INSERT INTO app_user (id, email, password_hash, role, status, created_at, updated_at)
VALUES (
    'a0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
    'admin@hrms.com',
    '$2a$10$8.ZpG2wV6zL9nNnK.MhGKO7r.L92lD2n5O.zGvX.V9wH8t2p9l9Gq',
    'HR_ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Seed the corresponding employee record for the dummy HR Admin so manager queries and self operations work
INSERT INTO employee (id, user_id, manager_id, full_name, department, designation, joining_date, employment_status, created_at, updated_at)
VALUES (
    'e0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
    'a0c1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
    NULL,
    'HR Administrator',
    'Human Resources',
    'HR Manager',
    '2026-06-12',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

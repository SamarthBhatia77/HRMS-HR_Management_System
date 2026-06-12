CREATE TABLE app_user (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE employee (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    manager_id CHAR(36) NULL,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(120) NOT NULL,
    designation VARCHAR(120) NOT NULL,
    joining_date DATE NOT NULL,
    employment_status VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) REFERENCES employee(id)
);

INSERT INTO users (id, created_at, updated_at, email, name, password, username)
    VALUES ('2cb9374e-4e52-4142-a1af-16144ef4a27d', '2023-07-16 10:34:44.000000', '2023-07-16 10:34:44.000000', 'anil1@senocak.com', 'Lucienne', '$2a$10$znsjvm5Y06ZJmpaWGHmmNu4iDJYhk369LR.R3liw2T4RjJcnt9c12', 'asenocakUser');
INSERT INTO users (id, created_at, updated_at, email, name, password, username)
    VALUES ('3cb9374e-4e52-4142-a1af-16144ef4a27d', '2023-07-16 10:34:44.000000', '2023-07-16 10:34:44.000000', 'anil2@senocak.com', 'Kiley', '$2a$10$znsjvm5Y06ZJmpaWGHmmNu4iDJYhk369LR.R3liw2T4RjJcnt9c12', 'asenocakAdmin');

INSERT INTO user_roles (user_id, role_id)
    VALUES ('2cb9374e-4e52-4142-a1af-16144ef4a27d', '4cb9374e-4e52-4142-a1af-16144ef4a27d');
INSERT INTO user_roles (user_id, role_id)
    VALUES ('3cb9374e-4e52-4142-a1af-16144ef4a27d', '5cb9374e-4e52-4142-a1af-16144ef4a27d');

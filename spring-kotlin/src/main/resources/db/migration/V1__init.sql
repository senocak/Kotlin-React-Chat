create table if not exists roles(
    id         varchar(255) not null  primary key,
    created_at timestamp,
    updated_at timestamp,
    name       varchar(255)
);

create table if not exists users(
    id         varchar(255) not null primary key,
    created_at timestamp,
    updated_at timestamp,
    email      varchar(255) constraint uk6dotkott2kjsp8vw4d0m25fb7    unique,
    name       varchar(255),
    password   varchar(255),
    username   varchar(255) constraint ukr43af9ap4edm43mmtq01oddj6 unique
);

create table if not exists user_roles(
    user_id varchar(255) not null constraint fkhfh9dx7w3ubf1co1vdev94g3f references users,
    role_id varchar(255) not null constraint fkh8ciramu9cc9q3qcqiv4ue8a6 references roles,
    primary key (user_id, role_id)
);

create table if not exists messages(
    id         varchar(255) not null primary key,
    body       text         not null,
    read       boolean      not null,
    from_id    varchar(255) not null constraint fk_message_from_user_id references users,
    to_id      varchar(255) not null constraint fk_message_to_user_id references users,
    created_at timestamp,
    updated_at timestamp
);

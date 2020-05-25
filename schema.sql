create schema if not exists orders collate utf8mb4_general_ci;

use orders;

grant select, update, delete, insert on `orders`.* to 'orders'@'%';

create table if not exists `orders`
(
    id            varchar(191) not null,
    origin_latitude      varchar(100) not null,
    origin_longitude     varchar(100) not null,
    destination_latitude      varchar(100) not null,
    destination_longitude     varchar(100) not null,
    distance      int unsigned not null,
    status        varchar(100) not null,
    assignee      varchar(100) null,
    created_at     timestamp   not null,
    updated_at    timestamp   DEFAULT CURRENT_TIMESTAMP  not null,
    constraint orders_id_uindex
        unique (id)
);

alter table `orders` add index orders_created_at_id_distance_status_index(created_at, id, distance, status);
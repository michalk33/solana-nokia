To install `PostgreSQL`:
`sudo apt install postgresql`

To create the database:
`sudo -u postgres createdb solana_project`
`sudo -u postgres psql`
and in `psql` prompt:
`alter user postgres with encrypted password 'password123';`
`\c solana_project`

Creating databases:
```
CREATE TABLE users (
    username varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL
);

CREATE TABLE job_offers (
    offerID SERIAL PRIMARY KEY,
    username varchar(255),
    description varchar(255) NOT NULL,
    latitude float NOT NULL,
    longitude float NOT NULL,
    radius float NOT NULL,
    post_date date NOT NULL,
    contract bool NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
); 

CREATE TABLE service_offers (
    serviceID SERIAL PRIMARY KEY,
    username varchar(255),
    description varchar(255) NOT NULL,
    latitude float NOT NULL,
    longitude float NOT NULL,
    radius float NOT NULL,
    post_date date NOT NULL,
    contract bool NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
);
```
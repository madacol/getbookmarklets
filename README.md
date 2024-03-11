# Setup Database

```sql
 -- replace 'password' - openssl rand -base64 30
CREATE USER getbookmarklets PASSWORD 'password';
CREATE DATABASE getbookmarklets OWNER getbookmarklets;
```

# Setup Environment

Rename `.env.example` to `.env` and replace the values with your own.

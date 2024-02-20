# Setup Database

```sql
CREATE USER getbookmarklets PASSWORD 'password'; -- replace 'password'
CREATE DATABASE getbookmarklets OWNER getbookmarklets;
-- GRANT ALL PRIVILEGES ON DATABASE getbookmarklets TO getbookmarklets;
```

# Setup Environment

Rename `.env.example` to `.env` and replace the values with your own.

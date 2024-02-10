Setup database credentials in psql

```sql
CREATE USER getbookmarklets PASSWORD 'password';
CREATE DATABASE getbookmarklets_dev OWNER getbookmarklets;
GRANT ALL PRIVILEGES ON DATABASE getbookmarklets_dev TO getbookmarklets;
```

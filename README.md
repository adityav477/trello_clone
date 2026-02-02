
### Start the application 
- clone the repository
  ```bash
  git clone "https://github.com/adityav477/trello_clone"
  ```
- create .env in ./backend and give necessary tokens and urls
- inside backend run 
  ```bash 
  npm i 
  ```

- run backend
  ```bash
  npm run dev
  ```

- for frontend go to {root of project}/frontend

- run 
  ```bash
   npm i 
  ```
- start frontend
  ```bash
  npm run dev
  ```

- migrate db by running
  ```bash
  npx prisma migrate --dev firstMigration 
  ```

- generate prisma client 
  ```bash
  npx prisma generate
  ```

- Seed Database in backend folder run
 ```bash
  node prisma/seed.js 
```
#### Upcoming features
- [ ] Sharing with rw and read_only featres
- [ ] upgrade to premium account



import pkg from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { db_host, db_name, db_password, db_user } from "../config/server-config.js";

const { PrismaClient } = pkg;

const adapter = new PrismaMariaDb({
  host: db_host,
  user: db_user,
  password: db_password,
  database: db_name,
  port: 3306,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true
})
const prisma = new PrismaClient({ adapter });

export default prisma;

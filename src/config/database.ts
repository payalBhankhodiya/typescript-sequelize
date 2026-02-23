import { Sequelize, type Dialect } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD as string;
const dbHost = process.env.DB_HOST as string;
const dbDriver = "postgres" as Dialect;
const dbPort = Number(process.env.DB_PORT) || 5432;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDriver,
  logging: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
export default sequelize;

import dotenv from "dotenv"

dotenv.config();

export const aws_accessToken = process.env.AWS_ACCESS_TOKEN;
export const aws_secretKey = process.env.AWS_SECRET_KEY;
export const bucketName = process.env.AWS_BUCKET;
export const region = process.env.AWS_REGION;

export const jwt_refresh_token_secret = process.env.JWT_REFRESH_TOKEN_SECRET;
export const jwt_access_token_secret = process.env.JWT_ACCESS_TOKEN_SECRET;

export const db_host = process.env.DB_HOST;
export const db_user = process.env.DB_USER
export const db_password = process.env.DB_PASSWORD;
export const db_name = process.env.DB_NAME


import 'dotenv/config';
import env from 'env-var';

export const envs = {
  PORT: env.get('PORT').required().asPortNumber(),
  SQLITE_DB_NAME: env.get('SQLITE_DB_NAME').required().asString()
};

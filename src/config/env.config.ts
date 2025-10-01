import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_DIALECT: z.string(),
  DB_URL: z.string(),
  ENVIRONMENT: z.enum(['development', 'production']).default('development'),
  PREMBLY_API_KEY: z.string(),
  PREMBLY_APP_ID: z.string(),
  PREMBLY_BASE_URL: z.string(),
})

const envSchemaValidation = envSchema.safeParse(process.env)

if (!envSchemaValidation.success) {
  console.log(envSchemaValidation.error.issues)
  process.exit(1)
}

export const env = envSchemaValidation.data

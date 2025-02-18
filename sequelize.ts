import 'ts-node/register';
import { execSync } from 'child_process';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const configPath = path.resolve('src/config/config.js');

const command = `npx sequelize-cli db:migrate --config ${configPath} --env ${env}`;

execSync(command, { stdio: 'inherit' });

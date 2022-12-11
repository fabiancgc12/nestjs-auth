import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : 'development.env';
  let filePath: string = resolve(`${dest}/${filename}`);
  console.log(`trying to load ${filename} from ${filePath}`)
  if (!existsSync(filePath)) {
    console.error(`failed to load ${filename}, loading fallback`)
    filePath = fallback;
  }

  return filePath;
}
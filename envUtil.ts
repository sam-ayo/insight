import * as dotenv from 'dotenv';

dotenv.config();

function loadEnv(keys: string[]): string[] {
  const invalidKeys: string[] = [];

  const values: string[] = keys.map((key) => {
    const value = process.env[key];
    if (value !== undefined) {
      return value;
    } else {
      invalidKeys.push(key);
      return '';
    }
  });

  if (invalidKeys.length > 0) {
    const invalidKeysStr = invalidKeys.join(', ');
    throw new Error(`Invalid keys: ${invalidKeysStr}`);
  }

  return values;
}

export default loadEnv;

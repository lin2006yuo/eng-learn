import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

export interface CliConfig {
  baseUrl: string;
  agentKey?: string;
  sessionCookie?: string;
  defaultFormat: 'json' | 'table';
}

const CONFIG_DIR = process.env.ENG_LEARN_CONFIG_DIR
  ? process.env.ENG_LEARN_CONFIG_DIR
  : join(homedir(), '.eng-learn-cli');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: CliConfig = {
  baseUrl: process.env.ENG_LEARN_API_URL || 'http://localhost:3000/api',
  defaultFormat: 'json',
};

export function loadConfig(): CliConfig {
  try {
    const data = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(data) as Partial<CliConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Partial<CliConfig>): void {
  const current = loadConfig();
  const next = { ...current, ...config };
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));
}

export function clearSession(): void {
  const config = loadConfig();
  delete config.sessionCookie;
  saveConfig(config);
}

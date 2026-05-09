import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

export interface CliConfig {
  baseUrl: string;
  agentKey?: string;
  apiToken?: string;
  defaultFormat: 'json' | 'table';
}

const CONFIG_DIR = process.env.ENG_LEARN_CONFIG_DIR
  ? process.env.ENG_LEARN_CONFIG_DIR
  : join(homedir(), '.eng-learn-cli');

const DEFAULT_CONFIG: CliConfig = {
  baseUrl: process.env.ENG_LEARN_API_URL || 'https://www.readtalk.cn/api',
  defaultFormat: 'json',
};

let configPath = join(CONFIG_DIR, 'config.json');

export function useLocalConfig(): void {
  configPath = join(CONFIG_DIR, 'config.local.json');
}

export function loadConfig(): CliConfig {
  try {
    const data = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(data) as Partial<CliConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Partial<CliConfig>): void {
  const current = loadConfig();
  const next = { ...current, ...config };
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(next, null, 2));
}

export function clearSession(): void {
  const config = loadConfig();
  delete config.apiToken;
  saveConfig(config);
}

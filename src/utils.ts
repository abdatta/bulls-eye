import fs from 'fs';
import { QueueConfig } from './handler';

export const setupLoggers = (debug: boolean) => {
    const warn = console.warn;
    console.warn = (...logs: any[]) => warn('\x1b[33m', ...logs, '\x1b[0m');
    const error = console.error;
    console.error = (...logs: any[]) => error('\x1b[31m', ...logs, '\x1b[0m');
    if (!debug) {
        console.log = console.debug = (...logs: any[]) => void 0;
    } else {
        console.warn('Debug mode is on. You can see logs now.');
    }
};

export const loadQueueConfigs = (filepath: string) => {
    if (!fs.existsSync(filepath)) throw new Error('Config file could not be found. Please make sure the file exists.');

    const rawConfig = JSON.parse(fs.readFileSync(filepath, 'utf-8')) as {[host: string]: QueueConfig[]};
    if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
        throw new Error('Invalid config format. Please provide a valid config.');
    }

    for (const host in rawConfig) {
        if (host.includes('/')) {
            throw new Error(`Invalid config format. Hostname cannot have '/' in it but found ${JSON.stringify(host)}.`)
        }
        const configs = rawConfig[host];
        if (!Array.isArray(configs)) {
            throw new Error(`Invalid config format. Expected an array for host ${JSON.stringify(host)} but found ${typeof configs}.`);
        }
        for (const config of configs) {
            if (!config.name || typeof config.name !== 'string') {
                throw new Error(`Invalid config format. Expected a valid string for queue name in host ${JSON.stringify(host)} but found ${typeof config.name}.`);
            }
            if (config.url && typeof config.url !== 'string') {
                throw new Error(`Invalid config format. Expected nothing or a valid string for queue url in host ${JSON.stringify(host)} but found ${typeof config.url}.`);
            }
        }
    }
    return rawConfig;
}

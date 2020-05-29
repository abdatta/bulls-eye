#!/usr/bin/env node

import minimist from 'minimist';
import fs from 'fs';
import { Server } from './server';

const args = minimist(process.argv.slice(2));

if (!args.config) throw new Error('No config file provided. Please provide a config file with the `--config` parameter.');
if (!fs.existsSync(args.config)) throw new Error('Config file provided not found. Please make sure the path is correct.');

Server.start({
    serverConfig: {
        port: parseInt(args.port || '3000')
    },
    queueConfigs: JSON.parse(fs.readFileSync(args.config, 'utf-8'))
});

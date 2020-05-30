#!/usr/bin/env node

import minimist from 'minimist';
import { setupLoggers, loadQueueConfigs } from './utils';
import { Server } from './server';

const args = minimist(process.argv.slice(2));

setupLoggers(args.debug);

if (!args.config) throw new Error('No config file provided. Please provide a config file with the `--config` parameter.');

Server.start({
    serverConfig: {
        port: parseInt(args.port || '3000')
    },
    queueConfigs: loadQueueConfigs(args.config)
});

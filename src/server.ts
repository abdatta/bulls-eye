import http from 'http';
import path from 'path';
import express from 'express';
import socketio from 'socket.io';
import { QueueHandler, QueueConfig } from './handler';
import { JobStatus } from 'bull';

export class Server {
  static start(appConfig: AppConfig) {
    const app = express();
    const server = http.createServer(app);
    const io = socketio(server);

    const queueHandlers = Object.keys(appConfig.queueConfigs).reduce((handlers, host) => {
        appConfig.queueConfigs[host]
            .forEach(config => {
                const queue = `${host}/${config.name}`;
                handlers[queue] = new QueueHandler(config, (e, ...d) => io.in(queue).emit(e, ...d))
            });
        return handlers;
    }, {} as {[host: string]: QueueHandler});

    app.use(express.static(path.join(__dirname, 'public')));

    io.on('connection', async client => {
        console.log('A user connected.');

        client.on('join', (channel: string) => {
            if (!queueHandlers[channel]) {
                console.warn('A user tried to join an invalid channel:', channel);
                return;
            }
            client.join(channel);
            console.log('A user joined channel:', channel);
            queueHandlers[channel].broadcastJobCounts((e, ...d) => client.emit(e, ...d));
        });

        client.on('disconnect', () => console.log('User disconnected.'));
    });

    app.get('/api/jobs/:host/:queue/:type(completed|waiting|active|delayed|failed|paused)', (req, res) => {
        const queue = `${req.params.host}/${req.params.queue}`;
        if (!queueHandlers[queue]) {
            res.sendStatus(404);
            return;
        }
        const jobType: JobStatus = req.params.type as JobStatus;
        const start: number = parseInt(req.query.start as string);
        const end: number = parseInt(req.query.end as string);
        queueHandlers[queue].fetchJobs(jobType, start, end - 1)
            .then(jobs => res.send(jobs))
            .catch(err => res.status(500).send(err));
    });

    app.get('/api/job/:host/:queue/:jobId', (req, res) => {
        const queue = `${req.params.host}/${req.params.queue}`;
        if (!queueHandlers[queue]) {
            res.sendStatus(404);
            return;
        }
        const jobId = req.params.jobId;
        queueHandlers[queue].fetchJob(jobId)
            .then(job => res.send(job))
            .catch(err => res.status(500).send(err));
    });

    app.get('/api/queues', (req, res) => {
        const queues = Object.keys(appConfig.queueConfigs).map(host => ({
            title: host,
            children: appConfig.queueConfigs[host].map(queue => ({
                title: queue.name
            }))
        }));
        res.send(queues);
    })

    server.listen(appConfig.serverConfig.port, () => {
      console.log('Server listening to', appConfig.serverConfig.port);
    });
  }
}

export interface AppConfig {
    serverConfig: {
        port: number;
    };
    queueConfigs: {
          [host: string]: QueueConfig[]
    };
}

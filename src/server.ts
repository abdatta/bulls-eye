import http from 'http';
import path from 'path';
import express from 'express';
import socketio from 'socket.io';
import { QueueHandler, QueueConfig } from './handler';
import { JobStatus } from 'bull';

export class Server {
  static start(config: AppConfig) {
    const app = express();
    const server = http.createServer(app);
    const io = socketio(server);
    const handler = new QueueHandler(config.queueConfigs[0], io);

    app.use(express.static(path.join(__dirname, 'public')));

    io.on('connection', async client => {
      console.log('A user connected.');
      client.on('disconnect', () => console.log('User disconnected.'));
      handler.broadcastJobCounts(client);
    })

    app.get('/api/jobs/:type(completed|waiting|active|delayed|failed|paused)', (req, res) => {
      const jobType: JobStatus = req.params.type as JobStatus;
      const start: number = parseInt(req.query.start as string);
      const end: number = parseInt(req.query.end as string);
      handler.fetchJobs(jobType, start, end - 1)
        .then(jobs => res.send(jobs))
        .catch(err => res.status(500).send(err));
    });

    app.get('/api/job/:jobId', (req, res) => {
      const jobId = req.params.jobId;
      handler.fetchJob(jobId)
        .then(job => res.send(job))
        .catch(err => res.status(500).send(err));
    });

    server.listen(config.serverConfig.port, () => {
      console.log('Server listening to', config.serverConfig.port);
    });
  }
}

export interface AppConfig {
  serverConfig: {
    port: number;
  },
  queueConfigs: QueueConfig[]
}

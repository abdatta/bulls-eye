import http from 'http';
import express from 'express';
import socketio from 'socket.io';
import { JobEventsHandler } from './handler';
import { JobStatus } from 'bull';
import { config } from 'dotenv';

config(); // configuring environment variables

const staticServer = new (require('static-server'))({
  rootPath: __dirname + '/public',            // required, the root of the server file tree
  port: 3001,               // required, the port to listen
  name: 'bulls-eye',   // optional, will set "X-Powered-by" HTTP header
  host: '0.0.0.0',       // optional, defaults to any interface
  templates: {
    index: 'index.html',      // optional, defaults to 'index.html'
    notFound: 'index.html'    // optional, defaults to undefined
  }
});

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const handler = new JobEventsHandler(io);

io.on('connection', async client => {
  console.log('A user connected.');
  client.on('disconnect', () => console.log('User disconnected.'));
  handler.broadcastJobCounts(client);
})

app.get('/api/jobs/:type(completed|waiting|active|delayed|failed|paused)', (req, res) => {
  const jobType: JobStatus = req.params.type as JobStatus;
  handler.fetchJobs(jobType)
    .then(jobs => res.send(jobs))
    .catch(err => res.status(500).send(err));
});

server.listen(process.env.HTTP_PORT || 3000, () => {
  console.log('Server listening to', process.env.HTTP_PORT || 3000);
});

staticServer.start();

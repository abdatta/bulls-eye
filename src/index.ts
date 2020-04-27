import http from 'http';
import path from 'path';
import express from 'express';
import socketio from 'socket.io';
import { JobEventsHandler } from './handler';
import { JobStatus } from 'bull';
import { config } from 'dotenv';

config(); // configuring environment variables

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const handler = new JobEventsHandler(io);

app.use(express.static(path.join(__dirname, 'public')));

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

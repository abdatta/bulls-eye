import bull, { Queue, JobCounts, JobId, JobStatus, QueueOptions } from 'bull';
import { Server, Socket } from 'socket.io';

export class QueueHandler {
    private queue: Queue;
    private progressCache: {[id: string]: number} = {};
    private broadcast: (event: string, ...data: any[]) => boolean;

    constructor(config: QueueConfig, io: Server, room: string) {
        this.broadcast = (event, ...data) => io.in(room).emit(event, ...data);
        this.queue = new bull(config.name, config.options);
        this.setupListeners();
    }

    getJobCounts(): Promise<JobCounts> {
        return this.queue.getJobCounts();
    }

    broadcastJobCounts(socket?: Socket) {
        console.log('Broadcasting job counts');
        this.getJobCounts()
            .then(jobCounts => socket?.emit('job-counts', jobCounts) || this.broadcast('job-counts', jobCounts))
            .catch(err => console.log(err));
    }

    async fetchJob(jobId: string) {
        console.log(`fetching job with jobId:${jobId}`);
        const [job, logs] = await Promise.all([this.queue.getJob(jobId), this.queue.getJobLogs(jobId)]);
        return {...job, progress: job?.progress(), logs};
    }

    fetchJobs(jobType: JobStatus, start?: number, end?: number) {
        console.log(`fetching ${jobType} jobs with start=${start} and end=${end}`)
        return this.queue.getJobs([jobType], start, end, jobType === 'waiting');
    }

    broadcastProgress(jobId: string, progress: number) {
        if (this.progressCache[jobId] === progress) return;

        console.log('Broadcasting progress:', progress);
        this.progressCache[jobId] = progress;
        this.broadcast('progress', {id: jobId, progress});

        if (this.progressCache[jobId] === 100) delete this.progressCache[jobId];
    }

    setupListeners() {
        this.queue.on('global:error', (error) => {
            // An error occured.
            console.log('Triggered event: global:error');
        })

        this.queue.on('global:waiting', (jobId: JobId) => {
            // A Job is waiting to be processed as soon as a worker is idling.
            console.log('Triggered event: global:waiting');
            this.broadcastJobCounts();
        });

        this.queue.on('global:active', (job, jobPromise) => {
            // A job has started. You can use `jobPromise.cancel()`` to abort it.
            console.log('Triggered event: global:active');
            this.broadcastJobCounts();
        })

        this.queue.on('global:stalled', (job) => {
            // A job has been marked as stalled. This is useful for debugging job
            // workers that crash or pause the event loop.
            console.log('Triggered event: global:stalled');
            this.broadcastJobCounts();
        })

        this.queue.on('global:progress', (jobId, progress) => {
            // A job's progress was updated!
            this.broadcastProgress(jobId, progress);
        })

        this.queue.on('global:completed', (job, result) => {
            // A job successfully completed with a `result`.
            console.log('Triggered event: global:completed');
            this.broadcastJobCounts();
        })

        this.queue.on('global:failed', (job, err) => {
            // A job failed with reason `err`!
            console.log('Triggered event: global:failed');
            this.broadcastJobCounts();
        })

        this.queue.on('global:paused', () => {
            // The queue has been paused.
            console.log('Triggered event: global:paused');
            this.broadcastJobCounts();
        })

        this.queue.on('global:resumed', (job) => {
            // The queue has been resumed.
            console.log('Triggered event: global:resumed');
            this.broadcastJobCounts();
        })

        this.queue.on('global:cleaned', (jobs, type) => {
            // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
            // jobs, and `type` is the type of jobs cleaned.
            console.log('Triggered event: global:cleaned');
            this.broadcastJobCounts();
        });

        this.queue.on('global:drained', () => {
            // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
            console.log('Triggered event: global:drained');
            this.broadcastJobCounts();
        });

        this.queue.on('global:removed', (job) => {
            // A job successfully removed.
            console.log('Triggered event: global:removed');
            this.broadcastJobCounts();
        });
    }
}

export interface QueueConfig {
    name: string;
    options: QueueOptions
}

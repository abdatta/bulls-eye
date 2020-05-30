import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { Observable, NEVER } from 'rxjs';
import { NbMenuItem } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class AppService {

    private host: string;
    private queue: string;

    constructor(private socket: Socket,
                private http: HttpClient) {
        this.socket.on('connect', () => this.host && this.queue && this.joinQueue(this.host, this.queue));
    }

    getQueues(): Observable<NbMenuItem[]> {
        return this.http.get<NbMenuItem[]>(`/api/queues`);
    }

    joinQueue(host: string, queue: string): void {
        this.socket.emit('join', `${host}/${queue}`);
        this.host = host;
        this.queue = queue;
    }

    getJobCounts(): Observable<JobCounts> {
        return this.socket.fromEvent<JobCounts>('job-counts');
    }

    getJobs(type: string, start: number, end: number): Observable<Job[]> {
        if (!this.host || !this.queue) {
            return NEVER;
        }
        const host = encodeURIComponent(this.host);
        const queue = encodeURIComponent(this.queue);
        type = encodeURIComponent(type);
        return this.http.get<Job[]>(`/api/jobs/${host}/${queue}/${type}`, {
            params: {
                start: start.toString(),
                end: end.toString()
            }
        });
    }

    getJob(jobId: string): Observable<Job> {
        const host = encodeURIComponent(this.host);
        const queue = encodeURIComponent(this.queue);
        jobId = encodeURIComponent(jobId);
        return this.http.get<Job>(`/api/job/${host}/${queue}/${jobId}`);
    }

    getProgress(): Observable<{id: string, progress: number}> {
        return this.socket.fromEvent<{id: string, progress: number}>('progress');
    }
}

export interface JobCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface Job {
  id: string;
  name: string;
  progress: number;
  timestamp: string;
  attemptsMade: number;
  data: {[k: string]: any};
  opts?: {[k: string]: any};
  delay: number;
  finishedOn?: number;
  processedOn?: number;
  returnvalue?: any;
  failedReason?: string;
  stacktrace?: string[];
  logs?: {
    logs: string[];
    count: number;
  };
}

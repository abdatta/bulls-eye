import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private socket: Socket,
              private http: HttpClient) { }

  sendMessage(msg: string){
    this.socket.emit('job-counts', msg);
  }

  getJobCounts(): Observable<JobCounts> {
    return this.socket.fromEvent<JobCounts>('job-counts');
  }

  getJobs(type: string, start: number, end: number): Observable<Job[]> {
    return this.http.get<Job[]>('/api/jobs/' + type, {
      params: {
        start: start.toString(),
        end: end.toString()
      }
    });
  }

  getJob(jobId: string): Observable<Job> {
    return this.http.get<Job>('/api/job/' + jobId);
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


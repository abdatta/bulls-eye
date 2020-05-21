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

  getMessage(): Observable<JobCounts> {
    return this.socket.fromEvent<JobCounts>('job-counts');
  }

  getJobs(type: string, start: number, end: number) {
    return this.http.get<Job[]>('/api/jobs/' + type, {
      params: {
        start: start.toString(),
        end: end.toString()
      }
    });
  }

  getProgress() {
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
  delay: number;
  finishedOn: number;
  processedOn: number;
  returnvalue: any;
  stacktrace: string[];
}


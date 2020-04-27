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

  getJobs(type: string) {
    return this.http.get<any[]>('/api/jobs/' + type);
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

import { Component, OnInit } from '@angular/core';
import { NbWindowRef } from '@nebular/theme';
import { AppService, Job } from 'src/app/app.service';

@Component({
  selector: 'be-job-window',
  templateUrl: './job-window.component.html',
  styleUrls: ['./job-window.component.css']
})
export class JobWindowComponent implements OnInit {

  job: Job;

  constructor(public windowRef: NbWindowRef,
              private appService: AppService) {
              windowRef.stateChange.subscribe(state => console.log(windowRef.state));
  }

  ngOnInit(): void {
    this.appService.getJob(this.windowRef.config.context as string)
        .subscribe(job => {
          job.name = (!job.name || job.name === '__default__') ? job.data.name ?? job.name : job.name;
          this.job = job;
      });
  }

  minimize() {
    this.windowRef.minimize();
  }

  close() {
    this.windowRef.close();
  }

}

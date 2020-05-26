import { Component, OnInit } from '@angular/core';
import { NbWindowRef } from '@nebular/theme';
import { AppService, Job } from 'src/app/app.service';

@Component({
  selector: 'be-job-window',
  templateUrl: './job-window.component.html',
  styleUrls: ['./job-window.component.scss']
})
export class JobWindowComponent implements OnInit {

  job: Job;

  constructor(public windowRef: NbWindowRef,
              private appService: AppService) {
  }

  ngOnInit(): void {
    this.appService.getJob(this.windowRef.config.context as string)
        .subscribe(job => {
          job.name = (!job.name || job.name === '__default__') ? job.data.name ?? job.name : job.name;
          this.job = job;
      });
  }

  getProgressBarStatus(progress: number) {
    if (progress === 0) {
      return 'basic';
    }
    if (progress < 10) {
      return 'danger';
    }
    if (progress < 90) {
      return 'warning';
    }
    if (progress < 100) {
      return 'info';
    }
    return 'success';
  }

}

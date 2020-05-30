import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbWindowRef } from '@nebular/theme';
import { AppService, Job } from 'src/app/app.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'be-job-window',
    templateUrl: './job-window.component.html',
    styleUrls: ['./job-window.component.scss']
})
export class JobWindowComponent implements OnInit, OnDestroy {

    loading = true;
    job: Job;

    private getsDestroyed = new Subject<void>();

    constructor(public windowRef: NbWindowRef,
                private appService: AppService) {
    }

    ngOnInit(): void {
        this.fetchJob();
        this.appService.getJobCounts()
            .pipe(takeUntil(this.getsDestroyed))
            .subscribe(_ => this.fetchJob());
        this.appService.getProgress()
            .pipe(
                takeUntil(this.getsDestroyed),
                filter(({ id }) => id === this.job?.id)
            )
            .subscribe(({ progress }) => this.job.progress = progress);
    }

    fetchJob() {
        this.appService.getJob(this.windowRef.config.context as string)
            .subscribe(job => {
                job.name = (!job.name || job.name === '__default__') ? job.data.name ?? job.name : job.name;
                this.job = job;
                this.loading = false;
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

    ngOnDestroy() {
        this.getsDestroyed.next();
        this.getsDestroyed.complete();
    }

}

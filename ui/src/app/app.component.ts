import { Component, OnDestroy } from '@angular/core';
import {
  NbSidebarService,
  NbMenuItem,
  NbTreeGridDataSource,
  NbTreeGridDataSourceBuilder,
  NbToastrService,
  NbComponentStatus,
  NbGlobalPosition,
  NbMenuService,
  NbWindowService
} from '@nebular/theme';
import { AppService, Job } from './app.service';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ngxLocalStorage } from 'ngx-localstorage';
import { JobWindowComponent } from './components/job-window/job-window.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'be-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  queues: NbMenuItem[];

  tabs = [
    {
      title: 'Waiting',
      count: 0,
      status: 'basic'
    },
    {
      title: 'Active',
      count: 0,
      status: 'primary'
    },
    {
      title: 'Completed',
      count: 0,
      status: 'success'
    },
    {
      title: 'Failed',
      count: 0,
      status: 'danger'
    },
    {
      title: 'Delayed',
      count: 0,
      status: 'warning'
    },
    {
      title: 'Paused',
      count: 0,
      status: 'info'
    }
  ];

  // TODO: Currently, this updates only after job fetch was successful. This should not be the case. Make a separate variable if required.
  activeTab = 'Waiting';

  dataSource: NbTreeGridDataSource<Job>;

  data: Job[] = [];

  tableHeaders: {[k in keyof Job]?: string} = {
    id: 'ID',
    name: 'Name',
    progress: 'Progress',
    timestamp: 'Timestamp',
    attemptsMade: 'Attempts Made',
    delay: 'Delay',
    finishedOn: 'Finished On',
    processedOn: 'Processed On',
    returnvalue: 'Return Value'
  };

  @ngxLocalStorage({ nullTransformer: () => ['id', 'name', 'progress', 'timestamp', 'more']})
  shownTableHeaderKeys: (keyof Job | 'more')[];
  hiddenTableHeaderKeys = Object.keys(this.tableHeaders)
                                .filter((headerKey: keyof Job) => headerKey !== 'id')
                                .map((headerKey: keyof Job) => ({
                                  title: this.tableHeaders[headerKey],
                                  selected: this.shownTableHeaderKeys.includes(headerKey),
                                  data: headerKey
                                }));

  loading: boolean;
  loadingJobCounts: boolean;
  pageNumber = 1;
  totalPages = 1;
  readonly PAGE_SIZE = 15;

  private getsDestroyed = new Subject<void>();

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<Job>,
              private sidebarService: NbSidebarService,
              private toastrService: NbToastrService,
              private nbMenuService: NbMenuService,
              private windowService: NbWindowService,
              private service: AppService) {
    this.loadQueues()
        .then(() => this.joinQueue(this.queues[0].title, this.queues[0].children[0].title));
    this.updateJobCounts();
    this.updateProgress();
    this.addTableHeaderMenuListener();
    this.addQueueMenuListener();
  }

  async loadQueues() {
    const queues = await this.service.getQueues().toPromise();
    if (queues[0]) {
        queues[0].expanded = true;
        queues.forEach(queue => {
            queue.icon = 'hard-drive';
            queue.children.forEach(child => child.icon = 'trending-up');
        });
        if (queues[0].children?.[0]) {
            queues[0].children[0].selected = true;
            queues[0].selected = true;
        }
    }
    this.queues = queues;
  }

  joinQueue(host: string, queue: string) {
      this.loadingJobCounts = true;
      this.service.joinQueue(host, queue);
  }

  addQueueMenuListener() {
    this.nbMenuService.onItemClick()
        .pipe(
            takeUntil(this.getsDestroyed),
            filter(({ tag }) => tag === 'queues'),
            map(({ item }) => item)
        )
        .subscribe((item: NbMenuItem) => {
            this.joinQueue(item.parent.title, item.title);
            this.unselectAllMenuItems(this.queues);
            this.selectMenuItemHierarchy(item);
        });
  }

  addTableHeaderMenuListener() {
    this.nbMenuService.onItemClick()
        .pipe(
            takeUntil(this.getsDestroyed),
            filter(({ tag }) => tag === 'more-menu'),
            map(({ item }) => item),
        )
        .subscribe((item: NbMenuItem) => {
            item.selected = !item.selected;
            if (item.selected) {
                this.shownTableHeaderKeys = [...this.shownTableHeaderKeys.slice(0, -1), item.data, 'more'];
            } else {
                this.shownTableHeaderKeys = this.shownTableHeaderKeys.filter(h => h !== item.data);
            }
        });
  }

  toggleSidebar() {
    this.sidebarService.toggle(true);
  }

  updateJobCounts() {
    this.service.getJobCounts()
      .pipe(takeUntil(this.getsDestroyed))
      .subscribe(data => {
        this.tabs.forEach(tab => {
          const jobType = tab.title.toLowerCase();
          if (tab.count < data[jobType]) {
            this.showToastr(data[jobType] - tab.count, jobType);
          }
          tab.count = data[jobType];
        });
        this.loadingJobCounts = false;
        this.fetchJobs(this.activeTab);
      });
  }

  showToastr(no: number, type: string) {
    let toastrStatus: NbComponentStatus;
    let jobStatus: string;
    switch (type) {
      case 'waiting':
        toastrStatus = 'basic';
        jobStatus = 'is waiting';
        break;
      case 'active':
        toastrStatus = 'primary';
        jobStatus = 'is active';
        break;
      case 'completed':
        toastrStatus = 'success';
        jobStatus = 'has completed';
        break;
      case 'failed':
        toastrStatus = 'danger';
        jobStatus = 'has failed';
        break;
      case 'delayed':
        toastrStatus = 'warning';
        jobStatus = 'is delayed';
        break;
      case 'paused':
        toastrStatus = 'info';
        jobStatus = 'is paused';
        break;
    }
    this.toastrService.show(undefined, `${no} new ${type} job`, {
      status: toastrStatus,
      position: 'bottom-left' as NbGlobalPosition
    });
    this.playAudio();
  }

  playAudio(){
    const audio = new Audio();
    audio.src = '../assets/notif.mp3';
    audio.load();
    audio.play().catch(() => console.warn('Failed to play audio.'));
  }

  fetchJobs(type: string, page = this.pageNumber) {
    this.loading = true;
    this.service.getJobs(type.toLowerCase(), this.PAGE_SIZE * (page - 1), this.PAGE_SIZE * page)
      .subscribe(jobs => {
        jobs = jobs.map(job => ({
          ...job,
          name: (!job.name || job.name === '__default__') ? job.data.name ?? job.name : job.name
        }));
        this.data = jobs;
        this.pageNumber = page;
        this.tabs.forEach(tab => {
          if (tab.title === type) {
            this.totalPages = Math.ceil(tab.count / this.PAGE_SIZE) || 1;
          }
        });
        this.dataSource = this.dataSourceBuilder.create<TableNode>(this.data.map(data => ({ data, expanded: false })));
        this.activeTab = type;
        this.loading = false;
      });
  }

  updateProgress() {
    this.service.getProgress()
      .pipe(takeUntil(this.getsDestroyed))
      .subscribe(job => {
        this.data.forEach(d => {
          if (d.id === job.id) {
            d.progress = job.progress;
          }
        });
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

  openJobWindow(i: number) {
    const job = this.data[i];
    const jobWindowRef = this.windowService.open(JobWindowComponent, {
      title: `${job.id} ${job.name}`,
      windowClass: 'job-container',
      context: job.id
    });
  }

  selectMenuItemHierarchy(item: NbMenuItem) {
      item.selected = true;
      if (item.parent) {
          this.selectMenuItemHierarchy(item.parent);
      }
  }

  unselectAllMenuItems(items: NbMenuItem[]) {
      items.forEach(item => {
          item.selected = false;
          if (item.children) {
              this.unselectAllMenuItems(item.children);
          }
      });
  }

  ngOnDestroy() {
    this.getsDestroyed.next();
    this.getsDestroyed.complete();
  }
}

interface TableNode {
  data: Job;
  expanded: boolean;
}

import { Component } from '@angular/core';
import {
  NbSidebarService,
  NbMenuItem,
  NbTreeGridDataSource,
  NbTreeGridDataSourceBuilder,
  NbToastrService,
  NbComponentStatus,
  NbGlobalPosition,
  NbMenuService
} from '@nebular/theme';
import { AppService, Job } from './app.service';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'be-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bulls-eye-ui';

  items: NbMenuItem[] = [
    {
      title: 'Queues',
      icon: 'list',
      expanded: true,
      children: [
        {
          title: 'encode-queue'
        },
        {
          title: 'mux-queue'
        },
        {
          title: 'upload-queue'
        }
      ]
    }
  ];

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

  activeTab = 'waiting';

  dataSource: NbTreeGridDataSource<Job>;

  private data: Job[] = [];

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

  shownTableHeaderKeys: (keyof Job | 'more')[] = ['id', 'name', 'progress', 'timestamp', 'more'];
  hiddenTableHeaderKeys = Object.keys(this.tableHeaders)
                                .filter((headerKey: keyof Job) => headerKey !== 'id')
                                .map((headerKey: keyof Job) => ({
                                  title: this.tableHeaders[headerKey],
                                  selected: this.shownTableHeaderKeys.includes(headerKey),
                                  data: headerKey
                                }));

  loading: boolean;

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<Job>,
              private sidebarService: NbSidebarService,
              private toastrService: NbToastrService,
              private nbMenuService: NbMenuService,
              private service: AppService) {
      this.dataSource = dataSourceBuilder.create<TableNode>(this.data.map(data => ({ data, expanded: false })));
      this.updateJobCounts();
      this.fetchJobs();
      this.updateProgress();
      this.nbMenuService.onItemClick()
      .pipe(
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
    this.service.getMessage()
      .subscribe(data => {
        this.tabs.forEach(tab => {
          const jobType = tab.title.toLowerCase();
          if (tab.count < data[jobType]) {
            this.showToastr(data[jobType] - tab.count, jobType);
          }
          tab.count = data[jobType];
        });
        this.fetchJobs();
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
    audio.play();
  }

  changeTab(tab) {
    this.activeTab = tab.tabTitle;
    this.fetchJobs();
  }

  fetchJobs() {
    this.loading = true;
    this.service.getJobs(this.activeTab.toLowerCase())
      .subscribe(jobs => {
        this.data = jobs;
        this.dataSource = this.dataSourceBuilder.create<TableNode>(this.data.map(data => ({ data, expanded: false })));
        this.loading = false;
      });
  }

  updateProgress() {
    this.service.getProgress()
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
}

interface TableNode {
  data: Job;
  expanded: boolean;
}

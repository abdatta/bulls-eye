import { Component } from '@angular/core';
import {
  NbSidebarService,
  NbMenuItem,
  NbTreeGridDataSource,
  NbTreeGridDataSourceBuilder,
  NbToastrService,
  NbComponentStatus,
  NbGlobalPosition
} from '@nebular/theme';
import { AppService } from './app.service';
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

  dataSource: NbTreeGridDataSource<TableEntry>;

  private data: TableEntry[] = [];

  allColumns: (keyof TableEntry)[] = ['id', 'name', 'progress', 'timestamp', 'attempts'];

  tableHeaders: {[k in keyof TableEntry]: string} = {
    id: 'ID',
    name: 'Name',
    progress: 'Progress',
    timestamp: 'Timestamp',
    attempts: 'Attempts Made'
  };

  loading: boolean;

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<TableEntry>,
              private sidebarService: NbSidebarService,
              private toastrService: NbToastrService,
              private service: AppService) {
      this.dataSource = dataSourceBuilder.create<TableNode>(this.data.map(data => ({ data, expanded: false })));
      this.updateJobCounts();
      this.fetchJobs();
      this.updateProgress();
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
  }

  changeTab(tab) {
    this.activeTab = tab.tabTitle;
    this.fetchJobs();
  }

  fetchJobs() {
    this.loading = true;
    this.service.getJobs(this.activeTab.toLowerCase())
      .subscribe(jobs => {
        this.data = jobs.map(job => ({
          id: job.id,
          name: job.name,
          progress: job.progress,
          timestamp: moment(job.timestamp).format('lll'),
          attempts: job.attemptsMade
        }));
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

interface TableEntry {
  id: string;
  name: string;
  progress: number;
  timestamp: string;
  attempts: number;
}

interface TableNode {
  data: TableEntry;
  expanded: boolean;
}

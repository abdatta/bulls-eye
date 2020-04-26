import { Component } from '@angular/core';
import { NbSidebarService, NbMenuItem, NbMenuService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

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
      count: 2,
      status: 'basic'
    },
    {
      title: 'Active',
      count: 2,
      status: 'primary'
    },
    {
      title: 'Completed',
      count: 2,
      status: 'success'
    },
    {
      title: 'Failed',
      count: 2,
      status: 'danger'
    },
    {
      title: 'Delayed',
      count: 2,
      status: 'warning'
    },
    {
      title: 'Paused',
      count: 2,
      status: 'info'
    }
  ];

  dataSource: NbTreeGridDataSource<TableEntry>;

  private data: TableEntry[] = [
    {
      id: '1',
      name: '[YakuboEncodes] Otome Game no Hametsu Flag shika Nai Akuyaku Reijou ni Tensei shiteshimatta... - 04 [1080p 10bit][x265 HEVC][Multi-Subs]',
      progress: 40,
      timestamp: '12-04-20',
      attempts: 0
    }
  ];

  allColumns = Object.keys(this.data[0]);

  tableHeaders: {[k in keyof TableEntry]: string} = {
    id: 'ID',
    name: 'Name',
    progress: 'Progress',
    timestamp: 'Timestamp',
    attempts: 'Attempts Made'
  };

  constructor(dataSourceBuilder: NbTreeGridDataSourceBuilder<TableEntry>,
              private sidebarService: NbSidebarService,
              private menuService: NbMenuService) {
      this.dataSource = dataSourceBuilder.create<TableNode>(this.data.map(data => ({ data, expanded: false })));
  }

  toggleSidebar() {
    this.sidebarService.toggle(true);
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

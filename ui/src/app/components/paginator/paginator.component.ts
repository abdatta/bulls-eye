import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'be-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnChanges {

  @Input()
  currentPage: number;

  @Input()
  totalPages: number;

  @Output()
  toPage: EventEmitter<number>;

  pageButtons: PageButton[];

  constructor() {
    this.toPage = new EventEmitter<number>();
  }

  ngOnChanges(): void {
    this.pageButtons = this.constructPageButtons();
  }

  constructPageButtons(): PageButton[] {
    if (this.totalPages <= 1) {
      return [];
    }

    if (this.totalPages <= 5) {
      return Array(this.totalPages).fill(0).map((_, i) => ({
        type: 'page',
        value: i + 1
      } as PageButton));
    }

    if (this.currentPage <= 3) {
      return [
        ...Array(3).fill(0).map((_, i) => ({
          type: 'page',
          value: i + 1
        } as PageButton)),
        {
          type: 'ellipsis',
          value: null
        },
        {
          type: 'page',
          value: this.totalPages
        }
      ];
    }

    if (this.currentPage > this.totalPages - 3) {
      return [
        {
          type: 'page',
          value: 1
        },
        {
          type: 'ellipsis',
          value: null
        },
        ...Array(3).fill(0).map((_, i) => ({
          type: 'page',
          value: this.totalPages - 2 + i
        } as PageButton))
      ];
    }

    return [
      {
        type: 'page',
        value: 1
      },
      {
        type: 'ellipsis',
        value: null
      },
      {
        type: 'page',
        value: this.currentPage
      },
      {
        type: 'ellipsis',
        value: null
      },
      {
        type: 'page',
        value: this.totalPages
      }
    ];
  }

}

interface PageButton {
  type: 'page' | 'ellipsis';
  value: number;
}

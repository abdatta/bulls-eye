import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobWindowComponent } from './job-window.component';

describe('JobWindowComponent', () => {
  let component: JobWindowComponent;
  let fixture: ComponentFixture<JobWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

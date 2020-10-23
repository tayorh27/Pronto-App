import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketJobComponent } from './ticket-job.component';

describe('AddJobComponent', () => {
  let component: TicketJobComponent;
  let fixture: ComponentFixture<TicketJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

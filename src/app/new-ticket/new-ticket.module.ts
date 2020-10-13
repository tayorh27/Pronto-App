
import { MyNewTicketComponent } from './new-ticket.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from './../md/md.module';
import { MaterialModule } from './../app.module'
import { NewTicketRoutes } from './new-ticket.routing';
import { AgmCoreModule } from '@agm/core';
import { BrowserModule } from '@angular/platform-browser';
import { AddJobComponent } from "../add-job/add-job.component";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { SearchCustomerComponent } from './search-customer/search-customer';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(NewTicketRoutes),
    FormsModule,
    ReactiveFormsModule,
    MdModule,
    MaterialModule,
    NgbModule,
    // AddJobModule,
    AgmCoreModule.forRoot({
      apiKey: 'YOUR-API-KEY-HERE',
      libraries: ['places']
    })
  ],
  declarations: [
    MyNewTicketComponent,
    AddJobComponent,
    SearchCustomerComponent
  ],
})
export class NewTicketModule { }
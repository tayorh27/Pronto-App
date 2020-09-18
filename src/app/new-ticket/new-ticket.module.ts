
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

@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(NewTicketRoutes),
      FormsModule,
      MdModule,
      MaterialModule,
      AgmCoreModule.forRoot({
        apiKey: 'YOUR-API-KEY-HERE',
        libraries: ['places']
      })
    ],
    declarations: [
      MyNewTicketComponent
    ],
  })
  export class NewTicketModule { }
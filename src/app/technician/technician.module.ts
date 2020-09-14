import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from './../md/md.module';
import { MaterialModule } from './../app.module';

import { MyTechnicianComponent } from './technician.component';
import { TechnicianRoutes } from './technician.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TechnicianRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
  ],
  declarations: [MyTechnicianComponent],
})
export class TechnicianModule { }
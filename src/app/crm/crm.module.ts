
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from './../md/md.module';
import { MaterialModule } from './../app.module';
import { CRMComponent } from './crm.component';
import { CRMRoutes } from './crm.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CRMRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
  ],
  declarations: [CRMComponent],
})
export class CRMModule { }
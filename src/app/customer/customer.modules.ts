import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from './../md/md.module';
import { MaterialModule } from './../app.module';

import { MyCustomerComponent } from './customer.component';
import { CustomerRoutes } from './customer.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CustomerRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
  ],
  declarations: [MyCustomerComponent],
})
export class CustomerModule {}

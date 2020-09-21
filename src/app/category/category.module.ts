
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from './../md/md.module';
import { MaterialModule } from './../app.module';
import { MyCategoryComponent } from './category.component';
import { CategoryRoutes } from './category.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CategoryRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
  ],
  declarations: [MyCategoryComponent],
})
export class CategoryModule { }
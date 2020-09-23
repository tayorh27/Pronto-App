import { AddJobComponent } from './add-job.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from './../md/md.module';
import { MaterialModule } from './../app.module';
import { BrowserModule } from '@angular/platform-browser';
import { AddJobRoutes } from './add-job.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AddJobRoutes),
        FormsModule,
        MdModule,
        MaterialModule,

    ],
    declarations: [
        AddJobComponent
    ],
})
export class AddJobModule { }
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from './../md/md.module';
import { MaterialModule } from './../app.module';
import { BrowserModule } from '@angular/platform-browser';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { TechJobComponent } from './tech-job.component';
import { TechJobRoutes } from './tech-job.routing';
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(TechJobRoutes),
        FormsModule,
        MdModule,
        MaterialModule,
        NgbModule
    ],
    declarations: [
        TechJobComponent
    ],
})
export class TechJobModule { }
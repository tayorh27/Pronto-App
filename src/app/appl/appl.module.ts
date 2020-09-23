import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { HttpClientModule } from "@angular/common/http";

import { TagInputModule } from 'ngx-chips';
 
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { ColorPickerModule } from 'ngx-color-picker';
import { AppSettingsRoutes } from './appl.routing';
import { StatusComponent } from './status/status.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AppSettingsRoutes),
    FormsModule,
    MaterialModule,
    TagInputModule,
    HttpClientModule,
    NgbModule,
    ColorPickerModule
  ],
  declarations: [
    StatusComponent,
  ]
})

export class AppSettingsModule {}

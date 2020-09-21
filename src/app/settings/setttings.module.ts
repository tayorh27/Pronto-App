import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { SettingsComponent } from './settings.component';
import { SettingsRoutes } from './settings.routing';

@NgModule({
    imports: [
        RouterModule.forChild(SettingsRoutes),
        CommonModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        NgbModule,
    ],
    declarations: [SettingsComponent]
})

export class SettingsModule {}
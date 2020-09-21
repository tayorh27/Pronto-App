import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { LogsComponent } from './logs.component';
import { LogsRoutes } from './logs.routing';

@NgModule({
    imports: [
        RouterModule.forChild(LogsRoutes),
        CommonModule,
        FormsModule,
        MaterialModule
    ],
    declarations: [LogsComponent]
})

export class LogsModule {}

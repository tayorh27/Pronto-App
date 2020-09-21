import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { UsersComponent } from './users.component';
import { UsersRoutes } from './users.routing';

@NgModule({
    imports: [
        RouterModule.forChild(UsersRoutes),
        CommonModule,
        FormsModule,
        MaterialModule,
        NgbModule,
    ],
    declarations: [UsersComponent]
})

export class UsersModule {}

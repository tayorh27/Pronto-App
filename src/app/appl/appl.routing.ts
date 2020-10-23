import { Routes } from '@angular/router';
import { StatusComponent } from './status/status.component';



export const AppSettingsRoutes: Routes = [
    {
      path: '',
      children: [ {
        path: 'status',
        component: StatusComponent
    }]}
];

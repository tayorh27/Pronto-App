import { Routes } from '@angular/router';
import { CRMComponent } from './crm.component';

export const CRMRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CRMComponent,
      },
    ],
  },
];

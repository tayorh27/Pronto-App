import { Routes } from '@angular/router';

import { MyTechnicianComponent } from './technician.component';

export const TechnicianRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MyTechnicianComponent,
      },
    ],
  },
];

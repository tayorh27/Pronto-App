import { Routes } from '@angular/router';
import { TechJobComponent } from './tech-job.component';




export const TechJobRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: TechJobComponent,
      },
    ],
  },
];

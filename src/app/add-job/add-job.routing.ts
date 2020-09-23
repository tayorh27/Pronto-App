import { AddJobComponent } from './add-job.component';
import { Routes } from '@angular/router';




export const AddJobRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AddJobComponent,
      },
    ],
  },
];

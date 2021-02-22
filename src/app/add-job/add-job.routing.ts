import { AddJobComponent } from './add-job.component';
import { Routes } from '@angular/router';
import { SearchJobComponent } from './jobs/search-job.component';




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
  {
    path: ':type/:email',
    children: [
      {
        path: '',
        component: SearchJobComponent,
      },
    ],
  },
];

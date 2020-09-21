import { Routes } from '@angular/router';

import { MyCategoryComponent } from './category.component';

export const CategoryRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MyCategoryComponent,
      },
    ],
  },
];

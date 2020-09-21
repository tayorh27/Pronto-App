import { Routes } from '@angular/router';

import { MyCustomerComponent } from './customer.component';

export const CustomerRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MyCustomerComponent,
      },
    ],
  },
];

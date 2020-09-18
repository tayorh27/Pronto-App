import { MyNewTicketComponent } from './new-ticket.component';
import { Routes } from '@angular/router';




export const NewTicketRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MyNewTicketComponent,
      },
    ],
  },
];

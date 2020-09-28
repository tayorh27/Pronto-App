import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { LoginRouteGuard, RouteGuard } from './route.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule',
      },
      {
        path: 'customer',
        loadChildren: './customer/customer.modules#CustomerModule',
        canActivate: [RouteGuard],
      },
      {
        path: 'category',
        loadChildren: './category/category.module#CategoryModule',
        canActivate: [RouteGuard]
      },
      {
        path: 'components',
        loadChildren: './components/components.module#ComponentsModule',
      },
      {
        path: 'technician',
        loadChildren: './technician/technician.module#TechnicianModule',
        canActivate: [RouteGuard]
      },
      {
        path: 'new-ticket',
        loadChildren: './new-ticket/new-ticket.module#NewTicketModule',
        canActivate: [RouteGuard]
      },
      {
        path: 'jobs',
        loadChildren: './add-job/add-job.module#AddJobModule',
        canActivate: [RouteGuard]
      },
      {
        path: 'assigned-jobs',
        loadChildren: './tech-job/tech-job.module#TechJobModule',
        canActivate: [RouteGuard]
      },
      {
        path: 'settings',
        canActivate: [RouteGuard],
        loadChildren: './settings/setttings.module#SettingsModule'
      },
      {
        path: 'app-settings',
        canActivate: [RouteGuard],
        loadChildren: './appl/appl.module#AppSettingsModule'
      },
      {
        path: 'logs',
        canActivate: [RouteGuard],
        loadChildren: './logs/logs.module#LogsModule'
      },
      {
        path: 'forms',
        loadChildren: './forms/forms.module#Forms',
      },
      {
        path: 'tables',
        loadChildren: './tables/tables.module#TablesModule',
      },
      {
        path: 'maps',
        loadChildren: './maps/maps.module#MapsModule',
      },
      {
        path: 'widgets',
        loadChildren: './widgets/widgets.module#WidgetsModule',
      },
      {
        path: 'charts',
        loadChildren: './charts/charts.module#ChartsModule',
      },
      {
        path: 'calendar',
        loadChildren: './calendar/calendar.module#CalendarModule',
      },
      {
        path: '',
        loadChildren: './userpage/user.module#UserModule',
      },
      {
        path: '',
        loadChildren: './timeline/timeline.module#TimelineModule',
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'pages',
        loadChildren: './pages/pages.module#PagesModule',
        canActivate: [LoginRouteGuard]
      },
    ],
  },
];

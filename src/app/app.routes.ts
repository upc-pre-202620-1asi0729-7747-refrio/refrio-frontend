import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/presentation/components/layout/layout';
import { IamGuard } from './iam/infrastructure/iam.guard';

export const routes: Routes = [
  // Public routes — IAM
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./iam/presentation/views/sign-in-form/sign-in-form').then(m => m.SignInFormComponent),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./iam/presentation/views/sign-up-form/sign-up-form').then(m => m.SignUpFormComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./iam/presentation/views/forgot-password-form/forgot-password-form').then(m => m.ForgotPasswordFormComponent),
  },

  // Protected routes — inside Layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [IamGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./shared/presentation/views/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./inventory/presentation/views/inventory-list/inventory-list').then(m => m.InventoryListComponent),
      },
      {
        path: 'inventory/:id',
        loadComponent: () =>
          import('./inventory/presentation/views/inventory-detail/inventory-detail').then(m => m.InventoryDetailComponent),
      },
      {
        path: 'inventory/:id/batch/:batchId',
        loadComponent: () =>
          import('./inventory/presentation/views/inventory-batch-detail/inventory-batch-detail').then(m => m.InventoryBatchDetailComponent),
      },
      {
        path: 'shipments',
        loadComponent: () =>
          import('./shared/presentation/views/shipments/shipments').then(m => m.ShipmentsComponent),
      },
      {
        path: 'shipments/:id',
        loadComponent: () =>
          import('./shared/presentation/views/shipment-detail/shipment-detail').then(m => m.ShipmentDetailComponent),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./shared/presentation/views/suppliers/suppliers').then(m => m.SuppliersComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./analytics/presentation/views/analytics-view/analytics-view').then(m => m.AnalyticsViewComponent),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./alerting/presentation/views/alerts-view/alerts-view').then(m => m.AlertsViewComponent),
      },
      {
        path: 'alerts/:id',
        loadComponent: () =>
          import('./alerting/presentation/views/alert-detail/alert-detail').then(m => m.AlertDetailComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./shared/presentation/views/settings/settings').then(m => m.SettingsComponent),
      },
      {
        path: 'order-history',
        loadComponent: () =>
          import('./shared/presentation/views/order-history/order-history').then(m => m.OrderHistoryComponent),
      },
      {
        path: 'bodeguero-dashboard',
        loadComponent: () =>
          import('./shared/presentation/views/bodeguero-dashboard/bodeguero-dashboard').then(m => m.BodegueroDashboardComponent),
      },
      {
        path: 'bodeguero-suppliers',
        loadComponent: () =>
          import('./shared/presentation/views/bodeguero-suppliers/bodeguero-suppliers').then(m => m.BodegueroSuppliersComponent),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard' },
];

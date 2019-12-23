import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ClearanceComponent } from './clearance/clearance.component';
import { ClearanceTableComponent } from './clearance-table/clearance-table.component';
import { ResultComponent } from './result/result.component';
import { CanActivateRouteGuard } from './guards/can-activate-route.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'main', component: DashboardComponent, canActivateChild: [CanActivateRouteGuard], children: [
    { path: 'dashboard', component: HomeComponent },
    { path: 'clearance', component: ClearanceComponent },
    { path: 'clearance_table', component: ClearanceTableComponent },
    { path: 'result', component: ResultComponent },
  ] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

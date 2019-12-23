import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { MaterialModule } from "./materials";
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ClearanceComponent } from './clearance/clearance.component';
import { ClearanceTableComponent } from './clearance-table/clearance-table.component';
import { ResultComponent } from './result/result.component';
import { CanActivateRouteGuard } from './guards/can-activate-route.guard';
import { VerifyAdminComponent } from './verify-admin/verify-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    HomeComponent,
    ClearanceComponent,
    ClearanceTableComponent,
    ResultComponent,
    VerifyAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    MaterialModule,
    ToastrModule
  ],
  providers: [
    CookieService,
    CanActivateRouteGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

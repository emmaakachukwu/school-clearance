import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CanActivateRouteGuard implements CanActivateChild {

  constructor ( 
    private route: Router,
    private cookie: CookieService
  ) {}

  canActivateChild (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any { 
    if ( this.cookie.get('user') ) {
      return true;
    } else {
      this.route.navigate(['']);
      return false;
    }
  }

  

  
}

import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  showProgress: boolean = false;

  constructor(
    private data: DataService,
    private route: Router,
    private toast: ToastrService,
    private cookie: CookieService
  ) { 
    let user = localStorage.getItem('user');
    if ( user ) {
      this.cookie.set('user', user);
      this.route.navigate(['/main/dashboard']);
    }
  }

  ngOnInit() { }

  submit (a) {
    this.showProgress = true;
    let pload = {
      username: a.value.username,
      password: a.value.password,
      key: '01'
    }
    this.data.postMethod(pload).subscribe(
      data => {
        if (data['code'] != '00') {
          this.toast.error(data['message']);
          this.showProgress = false;
        } else {
          a.value.remember == true ? localStorage.setItem('user', data['cookie']) : ''; //if user checks remember me
          localStorage.setItem('username', a.value.username);
          this.cookie.set('user', data['cookie']);
          this.toast.success(data['message']);
          this.showProgress = false;
          this.data.changeinfo(a.value.username);
          this.route.navigate(['main/dashboard']);
        }
      }
    );
  }

}

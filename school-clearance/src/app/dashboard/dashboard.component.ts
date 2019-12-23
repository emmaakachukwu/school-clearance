import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: string;
  head: string;
  showProgress: boolean = false;
  userInfo

  constructor(
    private data: DataService,
    private cookie: CookieService,
    public route: Router
  ) {
    data.currentInfo.subscribe( info => this.userInfo = info );
    this.getUser();
   }

  ngOnInit() {
    this.data.currentLoader.subscribe(
      load => this.showProgress = load
    );

    this.data.currentHead.subscribe(
      head => this.head = head
    );
  }

  //get user details
  getUser () {
    let p = {
      user: this.userInfo || localStorage.getItem('username'),
      key: '04'
    }
    this.data.postMethod(p).subscribe(
      data => data['code'] != '00' ? this.user = '' : this.user = data['message'].firstname
    )
  }

  //logout
  onLogout () {
    //clear cookie and localStorage
    this.cookie.deleteAll();
    localStorage.clear();
    this.route.navigate(['']);
  }
}

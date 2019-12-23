import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clearance',
  templateUrl: './clearance.component.html',
  styleUrls: ['./clearance.component.css']
})
export class ClearanceComponent implements OnInit {

  levels;
  showProgress: boolean = false;
  userInfo;
  clearanceInfo;
  dues;
  bursaryPayments;
  otherPayments;
  sessions = [
    '2013/2014',
    '2014/2015',
    '2015/2016',
    '2016/2017',
    '2017/2018',
    '2018/2019',
    '2019/2020',
  ]

  constructor(
    private data: DataService,
    private route: Router,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.data.changeHead('Clearance'); //change the header
    this.data.currentInfo.subscribe(
      info => this.userInfo = info
    );
    
    if ( this.userInfo == '' ) { //check if user details was fetched successfully
      this.route.navigate(['/main/dashboard']);
    } else {
      //fetch department and faculty payments
      var dues;
      this.userInfo.department_cleared == '0' ? dues = this.userInfo.department : dues = this.userInfo.faculty; //set where to get the dues from
      let pl = {
        dues: dues,
        faculty: this.userInfo.faculty,
        key: '03'
      }
      this.data.postMethod(pl).subscribe(
        data => {
          if ( data['code'] != '00' ) {
            this.dues = data['message'];
            this.levels = data['cookie'];
          } else {
            this.dues = data['message'];
            this.levels = data['cookie'];
          }
        }
      );

      //fetch bursary and other payments
      this.data.postMethod({key: '07'}).subscribe(
        data => {
          data['code'] != '00' ? this.bursaryPayments = data['message'] : this.bursaryPayments = data['message'];
          console.log(this.bursaryPayments)
          if ( data['code'] != '00' ) {
            this.bursaryPayments = data['message'];
            this.otherPayments = data['cookie'];
          } else {
            this.bursaryPayments = data['message'];
            this.otherPayments = data['cookie'];
          }
        }
      )
    }    
  }

  //for dept and faculty clearance
  submit(a, type) {
    this.data.changeLoader(true);
    var t;
    var f;
    if ( type == 'd' ) {
      t = this.userInfo.department;
      f = 'department';
    } else if ( type == 'f' ) {
      t = this.userInfo.faculty;
      f = 'faculty';
    }

    let p = {
      clearance_for: t,
      pno: a.value.pno,
      user: this.userInfo.reg_no,
      pid: a.value.level.slice(0, 3) + '-' + a.value.due.slice(0, 2),
      level: a.value.level,
      cleared: a.value.due.slice(2,a.value.due.length),
      for: f,
      key: '05'
    }
    console.log(p)
    this.data.postMethod(p).subscribe(
      data => {
        if ( data['code'] != '00' && data['code'] != '101' ) {
          this.toast.error(data['message']);
          this.data.changeLoader(false);
        } else if ( data['code'] == '101' ) {
          this.toast.success(data['message']);
          this.data.changeLoader(false);
          location.reload();
        } else {
          this.toast.success(data['message']);
          a.resetForm();
          this.data.changeLoader(false);
        }
      }
    )
  }

  //for bursary clearance
  clearBursary (b) {
    this.data.changeLoader(true);
    let p = {
      key: '08',
      user: this.userInfo.reg_no,
      pno: b.value.pno,
      pid: b.value.due.slice(0,7),
      session: b.value.session,
      cleared: b.value.due.slice(7,b.value.due.length),
    }
    this.data.postMethod(p).subscribe(
      data => {
        if ( data['code'] != '00' && data['code'] != '101' ) {
          this.toast.error(data['message']);
          this.data.changeLoader(false);
        } else if ( data['code'] == '101' ) {
          this.toast.success(data['message']);
          this.data.changeLoader(false);
          location.reload();
        } else {
          this.toast.success(data['message']);
          b.resetForm();
          this.data.changeLoader(false);
        }
      }
    )
  }

  //for others
  clearOthers (c) {
    this.data.changeLoader(true);
    let p = {
      key: '09',
      user: this.userInfo.reg_no,
      pno: c.value.pno,
      pid: c.value.due.slice(0,7),
      cleared: c.value.due.slice(7,c.value.due.length)
    }
    this.data.postMethod(p).subscribe(
      data => {
        if ( data['code'] != '00' && data['code'] != '101' ) {
          this.toast.error(data['message']);
          this.data.changeLoader(false);
        } else if ( data['code'] == '101' ) {
          this.toast.success(data['message']);
          this.data.changeLoader(false);
          location.reload();
        } else {
          this.toast.success(data['message']);
          c.resetForm();
          this.data.changeLoader(false);
        }
      }
    )
  }

}

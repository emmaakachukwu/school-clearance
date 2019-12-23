import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clearance-table',
  templateUrl: './clearance-table.component.html',
  styleUrls: ['./clearance-table.component.css']
})
export class ClearanceTableComponent implements OnInit {

  userInfo;
  deptDues;
  facultyDues;
  bursaryDues;
  otherDues;

  constructor(
    private data: DataService,
    private route: Router,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.data.changeHead('Clearance table'); //change the header

    //get user details and fetch dues
    let p = {
      key: '04',
      user: localStorage.getItem('username')
    }
    this.data.postMethod(p).subscribe(
      data => {
        if ( data['code'] != '00' ) {
          this.toast.error(data['message']);
        } else {
          this.userInfo = data['message'];
          this.userInfo.department_cleared == '0' ? this.userInfo.departmentCleared = 'Not Cleared' : this.userInfo.departmentCleared = 'Cleared';
          this.userInfo.faculty_cleared == '0' ? this.userInfo.facultyCleared = 'Not Cleared' : this.userInfo.facultyCleared = 'Cleared';
          this.userInfo.bursary_cleared == '0' ? this.userInfo.bursaryCleared = 'Not Cleared' : this.userInfo.bursaryCleared = 'Cleared';
          let pl = {
            user: p.user,
            department: data['message'].department,
            faculty: data['message'].faculty,
            key: '10'
          }
          this.data.postMethod(pl).subscribe(
            data => {
              this.deptDues = data['message'][0];
              this.facultyDues = data['message'][1];
              this.bursaryDues = data['message'][2];
              this.otherDues = data['message'][3];
              console.log(this.otherDues)
            }
          )
        }
      }
    )
  }

}

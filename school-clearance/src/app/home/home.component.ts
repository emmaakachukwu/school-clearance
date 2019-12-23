import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  btnlbl;
  hidebtn = true;
  completed;
  userInfo;
  progressValue;
  clearanceArray = [];
  clearanceGrid;
  cg;
  breakpoint;

  constructor(
    private data: DataService,
    private route: Router,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.data.changeHead('Dashboard'); //change header

    // this.breakpoint = (window.innerWidth <= 750) ? 2 : 4;
    // this.breakpoint = (window.innerWidth <= 750) ? 2 : 4;
    if ( window.innerWidth <= 750 && window.innerWidth >=450 ) {
      this.breakpoint = 2;
    } else if ( window.innerWidth < 450 ) {
      this.breakpoint = 1;
    } else {
      this.breakpoint = 4;
    }

    //to know if user has started clearance already
    let p = {
      user: localStorage.getItem('username'),
      key: '02'
    }
    this.data.postMethod(p).subscribe(
      data => {
        if ( data['code'] == '01' ) {
          this.hidebtn = false;
          this.completed = data['message'];
        } else {
          this.btnlbl = data['message'];
        }
      }
    );
    
    //get user's details
    let pl = {
      key: '04',
      user: localStorage.getItem('username')
    }
    this.data.postMethod(pl).subscribe(
      data => {
        if ( data['code'] != '00' ) {
          this.toast.error(data['message']);
        } else {
          this.data.changeinfo(data['message']);
          this.userInfo = data['message'];

          this.cg = [
            { payment: 'Departmental Clearance', value: this.userInfo.department_cleared },
            { payment: 'Faculty Clearance', value: this.userInfo.faculty_cleared },
            { payment: 'Bursary Clearance', value: this.userInfo.bursary_cleared },
            { payment: 'Other Clearance', value: this.userInfo.others_cleared },
          ];

          for ( let c in this.cg ) {
            if ( this.cg[c].value == '1' ) {
              this.cg[c].background = '#2A4B8C';
              this.cg[c].color = '#fff';
            }
          }
          this.clearanceGrid = this.cg;
          console.log(this.clearanceGrid)

          //to get clearance progress value
          this.clearanceArray.push(this.userInfo.department_cleared, this.userInfo.faculty_cleared, this.userInfo.bursary_cleared, this.userInfo.others_cleared); //push all clearance status into the array
          if ( this.userInfo.cleared == '1' ) {
            this.progressValue = 100;
          } else {
            let percPerCleared = 100 / this.clearanceArray.length; //value for each clearance
            this.progressValue = 0; //keep progress value at 0
            this.clearanceArray.forEach(element => {
              if ( element == '1' ) {
                this.progressValue = this.progressValue + percPerCleared;
              }
            });
          }
        }
      }
    )
  }

  onResize (event) {
    // this.breakpoint = (event.target.innerWidth <= 750) ? 2 : 4;
    if ( event.target.innerWidth <= 750 && event.target.innerWidth >=450 ) {
      this.breakpoint = 2;
    } else if ( event.target.innerWidth < 450 ) {
      this.breakpoint = 1;
    } else {
      this.breakpoint = 4;
    }
  }

  // start () {
  //   this.data.changeLoader(true);
  //   let p = {
  //     key: '04',
  //     user: localStorage.getItem('username')
  //   }
  //   this.data.postMethod(p).subscribe(
  //     data => {
  //       if ( data['code'] != '00' ) {
  //         this.toast.error(data['message']);
  //         this.data.changeLoader(false);
  //       } else {
  //         this.data.changeinfo(data['message']);
  //         this.data.changeLoader(false);
  //         this.route.navigate(['/main/clearance']);
  //       }
  //     }
  //   )
  // }

  scroll () {
    $('html, body').animate({
      scrollTop: $("#howto").offset().top
    }, 500);
  }
}
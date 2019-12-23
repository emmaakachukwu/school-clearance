import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  userInfo;
  userResults;
  GPs = {
    _100L: 0,
    _200L: 0,
    _300L: 0,
    _400L: 0,
  };
  CGPA;

  hide100L: boolean = true;
  hide200L: boolean = true;
  hide300L: boolean = true;
  hide400L: boolean = true;
  hideCGPA: boolean = true;

  constructor(
    private data: DataService,
    private route: Router,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.data.changeHead('Result'); //change the header

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

          let pl = {
            user: p.user,
            department: data['message'].department,
            key: '11'
          }
          this.data.postMethod(pl).subscribe(
            data => {
              console.log(data['message']);
              this.userResults = data['message'];
            }
          )
        }
      }
    )
  }

  getGradeScore (score) {
    score = parseInt(score);
    if ( score >= 70) {
      return 5;
    } else if ( score < 70 && score >= 60 ) {
      return 4;
    } else if ( score < 60 && score >=50 ) {
      return 3;
    } else if ( score < 50 && score >=45 ) {
      return 2
    } else if ( score <45 && score >= 40 ) {
      return 1;
    } else {
      return 0;
    }
  }

  //to calculate gp
  calcGP (l) {
    let gp = 0; //current gp
    let cu = 0; //current total cu

      for ( let i in this.userResults ) {
        let gradeScore = this.getGradeScore(this.userResults[i]._100L_scores);
        console.log(gradeScore);
        gp = gp + (gradeScore * parseInt(this.userResults[i]._100L_cu));
        cu = cu + parseInt(this.userResults[i]._100L_cu);
      }
      this.GPs._100L = parseFloat((gp/cu).toFixed(2));

      gp = 0;
      cu = 0;
      for ( let i in this.userResults ) {
        let gradeScore = this.getGradeScore(this.userResults[i]._200L_scores);
        console.log(gradeScore);
        gp = gp + (gradeScore * parseInt(this.userResults[i]._200L_cu));
        cu = cu + parseInt(this.userResults[i]._200L_cu);
      }
      this.GPs._200L = parseFloat((gp/cu).toFixed(2));

      gp = 0;
      cu = 0;
      for ( let i in this.userResults ) {
        let gradeScore = this.getGradeScore(this.userResults[i]._300L_scores);
        gp = gp + (gradeScore * parseInt(this.userResults[i]._300L_cu));
        cu = cu + parseInt(this.userResults[i]._300L_cu);
      }
      this.GPs._300L = parseFloat((gp/cu).toFixed(2));

      gp = 0;
      cu = 0;
      for ( let i in this.userResults ) {
        let gradeScore = this.getGradeScore(this.userResults[i]._400L_scores);
        gp = gp + (gradeScore * parseInt(this.userResults[i]._400L_cu));
        cu = cu + parseInt(this.userResults[i]._400L_cu);
      }
      this.GPs._400L = parseFloat((gp/cu).toFixed(2));
    console.log(this.GPs)

    if ( l == '100L' ) {
      this.hide100L = false;
    } else if ( l == '200L' ) {
      this.hide200L = false;
    } else if ( l == '300L' ) {
      this.hide300L = false;
    } else if ( l == '400L' ) {
      this.hide400L = false;
    } else if ( l == 'CGPA' ) {
      let sum = 0;
      let count = 0;
      for ( let g in this.GPs ) {
        if( this.GPs.hasOwnProperty( g ) ) {
          sum += parseFloat( this.GPs[g] );
          ++ count;
        }
      }
      this.CGPA = parseFloat((sum / count).toFixed(2));
    }
  }

}

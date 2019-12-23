import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  userInfo;

  constructor(
    private http: HttpClient,
    private toast: ToastrService
  ) { }

  private loaderStatus = new BehaviorSubject<boolean>(false);
  currentLoader = this.loaderStatus.asObservable();

  changeLoader(progressBar: boolean){
    this.loaderStatus.next(progressBar);
  }

  private headSource = new BehaviorSubject<string>('');
  currentHead = this.headSource.asObservable();

  changeHead(head: string) {
    this.headSource.next(head);
  }

  private info = new BehaviorSubject<any>('');
  currentInfo = this.info.asObservable();

  changeinfo(info: any) {
    this.info.next(info);
  }

  //for sending payloads to the backend
  postMethod ( payLoad ) {
    return this.http.post ("http://localhost/project/projectapi.php", JSON.stringify(payLoad));
  }
}

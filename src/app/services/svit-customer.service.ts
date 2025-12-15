import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SVITCustomerService {
  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public baseUrl: string = "https://qa-svitapi.softexer.com";
  showLoader = new BehaviorSubject(false);
  public checkIsLoggedIn = new BehaviorSubject(false);
  public proceedCartPayment = new BehaviorSubject(false);
  public cartCountItems: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public cartTotalCount = this.cartCountItems.asObservable();
  public addcartItems: any[] = [];
  constructor(
    private http: HttpClient
  ) { }

  //DAshboard
  goToSignup(data: any, token: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/customer/signup`,
      data,
      // { headers: { aieonki: token } }
    );
  }

  login(data: any): any {
    return this.http.post(`https://qa-svitapi.softexer.com/api/customer/login`, data)
  }
  //DAshboard
  getDashboardData(data: any, token: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/admin/dashboard`,
      data,
      // { headers: { aieonki: token } }
    );
  }
  //Mocktest-Fetch
  GetMockTestPaper(data: any): Observable<any> {
    return this.http.post(
      `https://qa-svitapi.softexer.com/api/admin/mocktestfetch`,
      data,
      // { headers: { aieonki: token } }
    );
  }

  //set to halltktno
    SetToHallTktNo(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/admin/setHallTicket`,
      data,
      // { headers: { aieonki: token } }
    );
  }
}


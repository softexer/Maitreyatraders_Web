import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaitreyaCustomerService {
  public baseUrl: string = "https://live.maitreyatraderslimited.co.uk";
  public checkIsLoggedIn = new BehaviorSubject(false);
  public Signout = new BehaviorSubject(false);
  showLoader = new BehaviorSubject(false);
  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public proceedCartPayment = new BehaviorSubject(false);
  public cartCountItems: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public cartTotalCount = this.cartCountItems.asObservable();
  public addcartItems: any[] = [];
  public allCategoriesList: Array<any> = [];

  // private UserID: string = '';

  private _userId = ''; // 🧠 memory cache
  public userIdSubject = new BehaviorSubject<string>('NotLogin');

  userId$ = this.userIdSubject.asObservable();

  private latestOrder: any[] = [];



  
private latestOrderSubject = new BehaviorSubject<any[]>([]);
latestOrder$ = this.latestOrderSubject.asObservable();


  constructor(
    private http: HttpClient
  ) {
    this.loadCartItems();
    this.loadUSerID();
    this.loadLatestOrder();
  }


  //homepage Products
  HomepageData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/product/customerhomepage`);
  }

  //homepage Cats
  LoadAllCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/product/fetchcategories`);
  }

  //homepage Cats
  GetProducts_Of_Subcats(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/product/productlist`,
      data,
      // { headers: { aieonki: token } }
    );
  }

  //Order-insert
  InsertOrder(data: any, token: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/orders/orderinsert`,
      data,
      { headers: { maitreya: token } }
    );
  }

  //stripe
  createNewCustomer(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/payment/createnewcustomer`,
      data,
      // { headers: { aieonki: token } }
    );
  }

  //search
  SearchinHdr(data: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/admin/productsearch?searchText=${data.searchText}`
    );
  }
  createPaymentIntentInfo(obj: any): Observable<any> {
    return this.http.post(this.baseUrl + "/api/payment/stripepaymentinit", obj);
  }
  RegisterConference(data: any) {
    return this.http.post(`${this.baseUrl}/api/Conference/userconferenceregister`, data)
  }


  GetPromoDataDetails(data: any) {
    return this.http.post(`${this.baseUrl}/api/product/singleproduct`, data)
  }


  //Cart item procedures
  addToCart(item: any): void {
    const existingItem = this.addcartItems.find(cartItem => cartItem.ShopBookID === item.ShopBookID);
    if (existingItem) {
      for (var i in this.addcartItems) {
        if (this.addcartItems[i].ShopBookID == existingItem.ShopBookID) {
          this.addcartItems[i].Qty++;
          this.saveCartItems();
          this.cartCountItems.next(this.cartCountItems.value + 1);
          break; //Stop this loop, we found it!
        }
      }
    } else {
      this.addcartItems.push(item);
      this.saveCartItems();
      console.log(this.cartCountItems.value);
      this.cartCountItems.next(this.cartCountItems.value + 1);
    }

  }

  getCartItems(): any[] {
    return this.addcartItems;
  }
  private saveCartItems(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.addcartItems));
  }
  private loadCartItems(): void {
    const cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      this.addcartItems = JSON.parse(cartItems);
      let totqty = 0;
      this.addcartItems.filter(items => {
        totqty += Number(items.Qty);
      })
      this.cartCountItems.next(this.cartCountItems.value + totqty);
    }
  }
  loadUSerID() {
    const cid = localStorage.getItem('Userid');
    if (cid) {
      this.userIdSubject.next(cid);
    }
  }
  addToCartincrqty(item: any) {
    const existingItem = this.addcartItems.find(cartItem => cartItem.ShopBookID === item.ShopBookID);
    if (existingItem) {
      for (var i in this.addcartItems) {
        if (this.addcartItems[i].ShopBookID == existingItem.ShopBookID) {
          this.addcartItems[i].Qty++;
          this.saveCartItems();
          this.cartCountItems.next(this.cartCountItems.value + 1);
          break; //Stop this loop, we found it!
        }
      }
    } else {
      item.Qty = 1;
      this.addcartItems.push(item);
      this.cartCountItems.next(this.cartCountItems.value + 1);
      this.saveCartItems();
    }
  }
  addToCartdecrqty(item: any) {
    const index = this.addcartItems.findIndex(cartItem => cartItem.ShopBookID === item.ShopBookID);
    if (index !== -1) {
      const cartItem = this.addcartItems[index];
      if (cartItem.Qty > 1) {
        for (var i in this.addcartItems) {
          if (this.addcartItems[i].ShopBookID == item.ShopBookID) {
            this.addcartItems[i].Qty--;
            this.saveCartItems();
            this.cartCountItems.next(this.cartCountItems.value - 1);
            break; //Stop this loop, we found it!
          }
        }
        // cartItem.quantity--;
      } else {
        this.addcartItems.splice(index, 1);
        this.saveCartItems();
        this.cartCountItems.next(this.cartCountItems.value - 1);
      }
    }
  }
  removeCartItem(item: any) {
    const index = this.addcartItems.findIndex(cartItem => cartItem.ShopBookID === item.ShopBookID);
    if (index !== -1) {
      this.addcartItems.splice(index, 1);
      this.cartCountItems.next(this.cartCountItems.value - Number(item.Qty));
      this.saveCartItems();
    }
  }

  private _open = new BehaviorSubject<boolean>(false);
  isOpen$ = this._open.asObservable();

  open() {
    this._open.next(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this._open.next(false);
    document.body.style.overflow = '';
  }


  setUserId(id: string) {
    console.log(id)
    this._userId = id;
    localStorage.setItem("Userid", id)
    this.userIdSubject.next(id);
  }

  getUserId(): string {
    return this._userId;
  }

  isLoggedIn(): boolean {
    return !!this._userId;
  }

  clearUserId() {
    this._userId = '';
    this.userIdSubject.next('');
  }
setLatestOrder(order: any[]) {
  localStorage.setItem('latestOrder', JSON.stringify(order));
  this.latestOrderSubject.next(order);
}

loadLatestOrder() {
  const stored = localStorage.getItem('latestOrder');
  if (stored) {
    this.latestOrderSubject.next(JSON.parse(stored));
  }
}

clearLatestOrder() {
  localStorage.removeItem('latestOrder');
  this.latestOrderSubject.next([]);
}

  UserLogin(data: any) {
    return this.http.post(`${this.baseUrl}/api/customer/login`, data)
  }

  OrdersFetch(data: any) {
    return this.http.post(`${this.baseUrl}/api/product/ordersfetch`, data)
  }

}

import { Component, EventEmitter, Input, Output } from "@angular/core"
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ShopsService } from "src/app/services/shops.service";
import { MaitreyaCustomerService } from "src/app/services/maitreya-customer.service";


interface CartItem {
  id: number
  name: string
  weight: string
  originalPrice: number
  salePrice: number
  quantity: number
  image: string
  categoryId: number
  subcatId: number
   productID: string
}

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent {
  // @Input() isCartOpen = true
  // @Output() closeCartEvent = new EventEmitter<void>()
  @Input() isCartOpen = false;
  @Output() closeCartEvent = new EventEmitter<void>();
  discountCode = ""
  offerApplied = false
  deliveryFee = 1.5
  baseUrl: string = "";
  orderInfo: Array<any> = [];
  token: string = "";
  loggedIn: boolean = false;
  serverCartItems: Array<any> = [];
  cartItems: CartItem[] = []

  constructor(private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private shopService: ShopsService) { }

  ngOnInit(): void {
    this.baseUrl = this.CustomerService.baseUrl;
    let tken = localStorage.getItem("actoken");
    this.getCartItems();
    // // if (tken) {
    //   this.loggedIn = true;
    //   // this.token = tken;
    //   const storedCart = localStorage.getItem('cartItems');
    //   if (storedCart) {
    //     let cartItems = JSON.parse(storedCart);
    //     console.log(cartItems);
    //     this.addAllToCart(cartItems);
    //   } else {
    //     this.getCartItems();
    //   }

    // }

    // this.selectedCountryName = "India";
    // let users = localStorage.getItem("acuser");
    // if (users !== null) {
    //   this.user = JSON.parse(users);
    //   let tkn = localStorage.getItem("actoken");
    //   if(tkn){
    //     this.token = tkn;
    //   }else{
    //     this.router.navigateByUrl("/home");
    //   }
    //   this.isLoggedin = true;
    // } else {
    //   this.router.navigateByUrl("/home");
    //   this.user = {}
    // }

    // this.orderInfo = this.CustomerService.getCartItems();
    // console.log(this.orderInfo);
    // this.shippinAddressForm = this.fb.group({
    //   firstName: ["", [Validators.required, firstNameValidator]],
    //   lastName: ["", Validators.required],
    //   address: ["", Validators.required],
    //   city: ["", Validators.required],
    //   postCode: ["", [Validators.required, postalCodeValidator]],
    //   state: ["", Validators.required],
    //   country: ["", Validators.required],
    //   phoneNumber: ["", [Validators.required, mobileNumberValidator]],
    //   email: ["", [Validators.required, emailValidator]],
    //   selectedCountryName: ["", Validators.required],
    //   totalQty: ["", Validators.required],
    //   totalAmount: ["", Validators.required]
    // })
    this.orderInfo.filter(items => {
      // this.totalQty += Number(items.Qty);
      // this.totalAmount += Number((Number(items.Price) * Number(items.Qty)));
      // this.selectedCountryName = items.selectCountry;
    })
    // const paymentStatusObj = JSON.parse(localStorage.getItem("paymentStatus") || "{}");
    // if (paymentStatusObj && paymentStatusObj.PaymentData.paymentID) {
    //   this.paymentStatus();
    // }
  }
  addAllToCart(items: any[]) {
    // this.aiservice.showLoader.next(true);

    // const userID = this.user.userID;

    // items.forEach((item, index) => {
    //   const payload = {
    //     userID: userID,
    //     categoryID: item.categoryID,
    //     itemID: item.itemID,
    //     qunatity: item.locqunatity || 1,
    //     categoryName: item.categoryName,
    //     price: item.price,
    //     typeOfBook: item.typeOfBook
    //   };

    //   this.shopService.addToCartServer(payload, this.token).subscribe(
    //     (res: any) => {
    //       console.log(`Item ${index + 1} added:`, res);
    //       // Optional: Navigate only after last item
    //       if (index === items.length - 1) {
    //         localStorage.removeItem('cartItems');
    //         this.getCartItems();
    //         this.aiservice.showLoader.next(false);
    //       }
    //     },
    //     (err: HttpErrorResponse) => {
    //       console.error(`Error adding item ${index + 1}:`, err);
    //       this.openSnackBar(err.message, "");
    //       if (index === items.length - 1) {
    //         this.aiservice.showLoader.next(false);
    //       }
    //     }
    //   );
    // });
  }
  getCartItems() {
    this.serverCartItems = this.shopService.getCartItems();
    console.log(this.serverCartItems);
    this.cartItems = this.serverCartItems.map((item: any) => ({
      id: item.itemID,
      name: item.categoryName,
      weight: item.cartTitle || '',
      originalPrice: Number(item.price),
      salePrice: Number(item.price),   // adjust if discount exists
      quantity: item.locqunatity,
      image: item.cartImage,
      categoryId: item.categoryID,
      subcatId: item.subcatID,
      productID: item.productID
    }));

    this.shopService.updateCartCountFromApi(this.serverCartItems);
  }

  getCartItems2() {
    // let plsLoad = {
    //   userID: this.user.userID
    // }
    // this.shopService.showLoader.next(true);
    this.serverCartItems = this.shopService.getCartItems();
    // const posRes = this.shopService.getCartItems();
    console.log(this.serverCartItems);

    // this.serverCartItems = posRes;
    this.shopService.updateCartCountFromApi(this.serverCartItems);
    //  this.shopService.updateCartCountFromApi(posRes.CartData);
    let pobj = localStorage.getItem("paymentStatus");
    if (pobj) {
      const paymentStatusObj = JSON.parse(pobj);
      if (paymentStatusObj && paymentStatusObj.paymentData.paymentID) {
        // this.paymentStatus();
      }
    }

    //  this.shopService.getCartItems().subscribe((posRes: any) => {
    //     console.log(posRes);
    //     if (posRes.response == 3) {
    //       this.serverCartItems = posRes.CartData;
    //       this.shopService.updateCartCountFromApi(posRes.CartData);
    //       let pobj = localStorage.getItem("paymentStatus");
    //       if (pobj) {
    //         const paymentStatusObj = JSON.parse(pobj);
    //         if (paymentStatusObj && paymentStatusObj.paymentData.paymentID) {
    //           // this.paymentStatus();
    //         }
    //       }
    //       // this.shopService.showLoader.next(false);
    //     } else {
    //       // this.shopService.showLoader.next(false);
    //       // this.openSnackBar(posRes.message, "");
    //     }
    //   }, (err: HttpErrorResponse) => {
    //     console.log(err);
    //     // this.openSnackBar(err.message, "");
    //     // this.aiservice.showLoader.next(false);
    //     if (err.error instanceof Error) {
    //       console.warn("Client SIde Error", err.error);
    //     } else {
    //       console.warn("Server Error", err.error);
    //     }
    //   })
  }
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  get subTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.salePrice * item.quantity, 0)
  }

  get totalAmount(): number {
    return this.subTotal + this.deliveryFee
  }

  incrementQuantity(item: CartItem): void {
    item.quantity++
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--
    }
  }

  removeItem(item: CartItem): void {
    const index = this.cartItems.indexOf(item)
    if (index > -1) {
      this.cartItems.splice(index, 1)
    }
  }

  applyDiscount(): void {
    if (this.discountCode.trim()) {
      this.offerApplied = true
      console.log("[v0] Discount code applied:", this.discountCode)
      // Add discount logic here
    }
  }

  closeCart(): void {
  //  this.isCartOpen = false;
   this.closeCartEvent.emit();
  }

  checkout(): void {
    console.log("[v0] Proceeding to checkout")
    this.router.navigate(["/checkout"])
  }
}

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShopsService } from 'src/app/services/shops.service';
import { MaitreyaCustomerService } from 'src/app/services/maitreya-customer.service';

/* =======================
   Cart Item Interface
======================= */
export interface CartItem {
  id: number;
  productID: string;
  name: string;

  cartTitle: {
    weightNumber: number;
    weightUnit: string;
    productPrice: number;
    disCountProductprice: number;
  };

  weightLabel: string;
  originalPrice: number;
  salePrice: string;
  quantity: number;
  locqunatity: number;
  image: string;
  categoryId: string;
  subcatId: string;
  isFrozen: boolean;
  isFreeItem?: boolean;
  promoId?: string;
}
interface Offer {
  promotionID: string;
  offerType: 'buygetoffer';

  buyQunatity: number;
  getQuantity: number;

  advertisementImage: string;

  discountAmountPercentage: string; // empty string in API
  enterCoupanCode: string;          // empty string in API

  isActive: boolean;
  status: 'Active' | 'Inactive';

  applicableOn: 'CATEGORY' | 'PRODUCT';
  applicableIds: string[];

  selectFreeProductName: string;
  selectFreeProductID: string;

  timeStamp: string;
}


interface OfferMessage {
  promotionID: string;
  eligible: boolean;
  message: string;

}
@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {

  @Input() isCartOpen = false;
  @Output() closeCartEvent = new EventEmitter<void>();

  baseUrl = '';
  discountCode = '';
  offerApplied = false;
  // discountAmount = 0;

  cartItems: CartItem[] = [];
  serverCartItems: any[] = [];

  /* ===== Charges ===== */
  MIN_ORDER_AMOUNT = 35;
  FREE_DELIVERY_LIMIT = 80;
  DELIVERY_CHARGE = 4.99;
  FROZEN_SURCHARGE = 2.99;


  isOfferApplicable: boolean = false;
  offerProductId = "";
  offerText: string = '';
  buyGetPromotion: Offer[] = [];
  discountOffer: any[] = [];

  showOfferSection = false;

  offerProductImage = "../../../assets/side1.png"


  discountAmount = 0;
  discountPromotion: any = null;
  discountError = '';
  
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private shopService: ShopsService
  ) { }

  ngOnInit(): void {
    this.baseUrl = this.CustomerService.baseUrl;
    this.subscribeCart();

    // this.buyGetPromotion = JSON.parse(localStorage.getItem('BUY_GET_PROMO') || 'null');
    this.buyGetPromotion = [
      {
        "promotionID": "PROMO@1768819679867",
        "offerType": "buygetoffer",
        "buyQunatity": 3,
        "getQuantity": 1,
        "advertisementImage": "/images/Promotions/Pid@Tue Jan 20 2026 04:02:47 GMT+0000 (Coordinated Universal Time)_banner.png",
        "discountAmountPercentage": "",
        "enterCoupanCode": "",
        "isActive": true,
        "status": "Active",
        "applicableOn": "CATEGORY",
        "applicableIds": [
          "CID1xZc9e@1767770937292"
        ],
        "selectFreeProductName": "Soya Paneer",
        "selectFreeProductID": "PID@1767874166770",
        "timeStamp": "1768905708257"
      }]
    let disoffer = localStorage.getItem('DISCOUNT_PROMO');
    if (disoffer) {
      this.discountOffer = JSON.parse(disoffer);
    }

    console.log(this.discountOffer)
  }

  /* =======================
      Cart Subscription
  ======================= */
  private subscribeCart(): void {
    this.shopService.getCart().subscribe(cart => {
      this.serverCartItems = cart;
      console.log(cart)
      this.cartItems = cart.map((item: any): CartItem => ({
        id: item.itemID,
        productID: item.productID,
        name: item.categoryName,

        cartTitle: item.cartTitle,

        weightLabel: `${item.cartTitle?.weightNumber || ''}${item.cartTitle?.weightUnit || ''}`,

        originalPrice: item.cartTitle?.productPrice || 0,
        salePrice: item.price || item.cartTitle?.productPrice || "0",

        quantity: item.locqunatity,
        locqunatity: item.locqunatity,

        image: item.cartImage,
        categoryId: item.categoryID,
        subcatId: item.subcatID,

        isFrozen: item.isFrozen || false,
        isFreeItem: item.isFreeItem || false,
        promoId: item.promoId || null
      }));
      // const result = this.checkCategoryOffer(this.cartItems, this.buyGetPromotion && this.buyGetPromotion.length > 0 ? this.buyGetPromotion : []);
      // console.log(result);

      // // 🔥 HANDLE UI VISIBILITY
      // if (result?.length) {
      //   const offer = result[0];

      //   this.offerText = offer.message;

      //   // 👉 show ONLY when eligible is false
      //   this.showOfferSection = offer.eligible === false;

      //   localStorage
      // } else {
      //   this.showOfferSection = false;
      // }
    });
  }

  /* =======================
      Calculations
  ======================= */
  getTotalItems(): number {
    return this.cartItems.reduce((t, i) => t + i.quantity, 0);
  }

  get subtotal(): number {
    return this.cartItems.reduce(
      (t, i) => t + Number(i.salePrice) * i.quantity,
      0
    );
  }

  get deliveryFee(): number {
    return this.subtotal >= this.FREE_DELIVERY_LIMIT
      ? 0
      : this.DELIVERY_CHARGE;
  }

  get frozenCharge(): number {
    return this.cartItems.some(i => i.isFrozen)
      ? this.FROZEN_SURCHARGE
      : 0;
  }

  get totalToPay(): number {
    return this.subtotal + this.deliveryFee + this.frozenCharge;
  }

  /* =======================
      Cart Actions
  ======================= */
  incrementQuantity(item: CartItem): void {
    this.shopService.updateItem({
      productID: item.productID,
      cartTitle: item.cartTitle,
      locqunatity: item.locqunatity + 1
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.locqunatity > 1) {
      this.shopService.updateItem({
        productID: item.productID,
        cartTitle: item.cartTitle,
        locqunatity: item.locqunatity - 1
      });
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem): void {
    this.shopService.removeFromCart(item.productID, item.cartTitle);
  }

  /* =======================
      Discount
  ======================= */
  // applyDiscount(): void {
  //   if (!this.discountCode.trim()) return;

  //   this.offerApplied = true;
  //   console.log('Discount applied:', this.discountCode);
  // }

  applyDiscount(): void {
    let discountCode = "";
    this.discountAmount = 0;
    this.cartItems.filter((items: any) => {
      console.log(items);
      if (!items.isFreeItem) {
        this.discountOffer.filter((ditems: any) => {
          console.log(ditems);
          if (ditems.selectFreeProductID == items.categoryId && ditems.applicableIds.includes(items.subcatId)) {
            this.discountCode = ditems.enterCoupanCode;
            this.discountAmount += ((items.salePrice) * (Number(items.locqunatity) * Number(ditems.discountAmountPercentage))) / 100
            
          }
        })
      }
    })
     localStorage.setItem('Discount',this.discountAmount.toString())
    console.log(this.discountAmount);
  }
  calculateDiscountAmount(cartItems: any[], promo: any): number {
    let discount = 0;
    const percentage = Number(promo.discountAmountPercentage);

    cartItems.forEach(item => {
      if (
        promo.applicableOn === 'SUBCATEGORY' &&
        promo.applicableIds.includes(item.subcatID)
      ) {
        discount += (Number(item.price) * item.locqunatity * percentage) / 100;
      }
    });

    return discount;
  }
  get totalAmount(): number {
    return (
      this.subtotal +
      this.deliveryFee +
      this.frozenCharge -
      this.discountAmount
    );
  }

  /* =======================
      Navigation
  ======================= */
  closeCart(): void {
    this.closeCartEvent.emit();
  }

  checkout(): void {
    this.closeCartEvent.emit();
    this.router.navigate(['/checkout']);
  }

  navigateToProducts(): void {
    this.closeCartEvent.emit();
    this.router.navigate(['/products']);
  }

  checkCategoryOffer(
    cart: CartItem[],
    offerdata: Offer[]
  ): OfferMessage[] {

    const messages: OfferMessage[] = [];

    offerdata.forEach((offer: Offer) => {

      if (!offer.isActive || offer.applicableOn !== "CATEGORY") return;

      const applicableCategoryIds = offer.applicableIds;
      const buyQty = offer.buyQunatity;

      // ✅ PAID ITEMS ONLY (IMPORTANT)
      const paidItems = cart.filter(
        item =>
          applicableCategoryIds.includes(item.categoryId) &&
          item.isFreeItem !== true
      );

      // ✅ TOTAL PAID QUANTITY
      const totalPaidQty = paidItems.reduce(
        (sum, item) => sum + (item.locqunatity || 0),
        0
      );

      // ✅ CHECK IF FREE ITEM ALREADY EXISTS FOR THIS PROMO
      const freeItemAlreadyAdded = cart.some(
        item =>
          item.isFreeItem === true &&
          item.promoId === offer.promotionID
      );

      // 🔒 If free item already added → STOP
      if (freeItemAlreadyAdded) {
        messages.push({
          promotionID: offer.promotionID,
          eligible: true,
          message: `🎉 Offer applied! You get ${offer.getQuantity} FREE (${offer.selectFreeProductName})`
        });
        return;
      }

      // ❌ NOT ENOUGH PAID ITEMS
      if (totalPaidQty < buyQty) {
        const remainingQty = buyQty - totalPaidQty;

        messages.push({
          promotionID: offer.promotionID,
          eligible: false,
          message: `Add ${remainingQty} more product(s) from this category to get ${offer.getQuantity} FREE (${offer.selectFreeProductName})`
        });
      }
      // ✅ ENOUGH PAID ITEMS (AND FREE ITEM NOT YET ADDED)
      else {
        messages.push({
          promotionID: offer.promotionID,
          eligible: true,
          message: `🎉 Offer applied! You get ${offer.getQuantity} FREE (${offer.selectFreeProductName})`
        });
      }
    });

    return messages;
  }


  // checkCategoryOffer(
  //   cart: CartItem[],
  //   offerdata: Offer[]
  // ): OfferMessage[] {

  //   console.log(cart, offerdata);
  //   const messages: OfferMessage[] = [];

  //   offerdata.forEach((offer: Offer) => {

  //     if (!offer.isActive || offer.applicableOn !== "CATEGORY") return;

  //     const applicableCategoryIds: string[] = offer.applicableIds;
  //     const buyQty: number = offer.buyQunatity;

  //     const matchingItems: CartItem[] = cart.filter(
  //       (item: CartItem) =>
  //         applicableCategoryIds.includes(item.categoryId) &&
  //         !item.isFreeItem
  //     );

  //     const totalQty: number = matchingItems.length;

  //     if (totalQty < buyQty) {
  //       const remainingQty: number = buyQty - totalQty;

  //       messages.push({
  //         promotionID: offer.promotionID,
  //         eligible: false,
  //         message: `Add ${remainingQty} more product(s) from this category to get ${offer.getQuantity} FREE (${offer.selectFreeProductName})`
  //       });

  //     } else {
  //       messages.push({
  //         promotionID: offer.promotionID,
  //         eligible: true,
  //         message: `🎉 Offer applied! You get ${offer.getQuantity} FREE (${offer.selectFreeProductName})`
  //       });
  //     }
  //   });

  //   return messages;
  // }



}










// import { Component, EventEmitter, Input, Output } from "@angular/core"
// import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { HttpErrorResponse } from '@angular/common/http';
// import { ShopsService } from "src/app/services/shops.service";
// import { MaitreyaCustomerService } from "src/app/services/maitreya-customer.service";


// interface CartItem {
//   id: number;
//   productID: string;
//   name: string;
//   // 👇 ADD THIS
//   cartTitle: {
//     weightNumber: number;
//     weightUnit: string;
//     productPrice: number;
//     disCountProductprice: number;
//   };

//   weightLabel: string;

//   originalPrice: number;
//   salePrice: number;

//   quantity: number;
//   locqunatity: number;

//   image: string;
//   categoryId: string;
//   subcatId: string;
//   isFrozen: boolean;
//   isFreeItem?: boolean;
//   promoId?: string;
// }

//  interface Offer {
//   promotionID: string;
//   offerType: 'buygetoffer';

//   buyQunatity: number;
//   getQuantity: number;

//   advertisementImage: string;

//   discountAmountPercentage: string; // empty string in API
//   enterCoupanCode: string;          // empty string in API

//   isActive: boolean;
//   status: 'Active' | 'Inactive';

//   applicableOn: 'CATEGORY' | 'PRODUCT';
//   applicableIds: string[];

//   selectFreeProductName: string;
//   selectFreeProductID: string;

//   timeStamp: string;
// }

// // interface CartItem {
// //     productID: string;
// //     categoryId: string;
// //     isFreeItem: boolean;
// // }

// interface OfferMessage {
//   promotionID: string;
//   eligible: boolean;
//   message: string;
// }

// @Component({
//   selector: 'app-shopping-cart',
//   templateUrl: './shopping-cart.component.html',
//   styleUrls: ['./shopping-cart.component.css']
// })
// export class ShoppingCartComponent {
//   // @Input() isCartOpen = true
//   // @Output() closeCartEvent = new EventEmitter<void>()
//   @Input() isCartOpen = false;
//   @Output() closeCartEvent = new EventEmitter<void>();
//   discountCode = ""
//   offerApplied = false
//   // deliveryFee = 1.5
//   baseUrl: string = "";
//   orderInfo: Array<any> = [];
//   token: string = "";
//   loggedIn: boolean = false;
//   serverCartItems: Array<any> = [];
//   cartItems: CartItem[] = [];


//   MIN_ORDER_AMOUNT = 35;
//   FREE_DELIVERY_LIMIT = 80;
//   DELIVERY_CHARGE = 4.99;
//   FROZEN_SURCHARGE = 2.99;

//   isOfferApplicable: boolean = false;
//   offerProductId = "";
//   offerText: string = '';

//   offerProductImage = "../../../assets/side1.png"
//   // buyGetPromotion: any = null;

// buyGetPromotion: Offer[] = [];

//   discountAmount = 0;
//   discountPromotion: any = null;
//   discountError = '';


//   constructor(private router: Router,
//     private snackBar: MatSnackBar,
//     private CustomerService: MaitreyaCustomerService,
//     private shopService: ShopsService) { }

//   ngOnInit(): void {
//     this.baseUrl = this.CustomerService.baseUrl;
//     // this.buyGetPromotion = JSON.parse(localStorage.getItem('BUY_GET_PROMO') || 'null');
//     this.buyGetPromotion = [
//       {
//         "promotionID": "PROMO@1768819679867",
//         "offerType": "buygetoffer",
//         "buyQunatity": 3,
//         "getQuantity": 1,
//         "advertisementImage": "/images/Promotions/Pid@Tue Jan 20 2026 04:02:47 GMT+0000 (Coordinated Universal Time)_banner.png",
//         "discountAmountPercentage": "",
//         "enterCoupanCode": "",
//         "isActive": true,
//         "status": "Active",
//         "applicableOn": "CATEGORY",
//         "applicableIds": [
//           "CID1xZc9e@1767770937292"
//         ],
//         "selectFreeProductName": "Soya Paneer",
//         "selectFreeProductID": "PID@1767874166770",
//         "timeStamp": "1768905708257"
//       }]

//     console.log(this.buyGetPromotion)

//     this.discountPromotion =
//       this.shopService.getDiscountPromotion() ||
//       JSON.parse(localStorage.getItem('DISCOUNT_PROMO') || 'null');


//     this.subscribeCart();
//     // this.offerText = `Buy ${this.buyGetPromotion.buyQunatity} Get ${this.buyGetPromotion.getQuantity} Free`;

//   }
//   private subscribeCart() {
//     this.shopService.getCart().subscribe(cart => {
//       this.serverCartItems = cart;

//       this.cartItems = cart.map((item: any) => ({
//         id: item.itemID,
//         productID: item.productID,
//         name: item.categoryName,
//         cartTitle: item.cartTitle,
//         weightLabel: `${item.cartTitle.weightNumber} ${item.cartTitle.weightUnit}`,
//         originalPrice: item.cartTitle.productPrice,
//         salePrice: item.isFreeItem ? 0 : item.price,
//         quantity: item.locqunatity,
//         locqunatity: item.locqunatity,
//         image: item.cartImage,
//         categoryId: item.categoryID,
//         subcatId: item.subcatID,
//         isFrozen: item.isFrozen || false,
//         isFreeItem: item.isFreeItem || false,
//         promoId: item.promoId || null
//       }));
//       console.log(this.cartItems)

//       // 🔥 IMPORTANT: Sync free product AFTER cart update
//       // this.syncFreeProduct();
//       // let reulst =  this.checkCategoryOffer(this.cartItems, this.buyGetPromotion ? [this.buyGetPromotion] : []);
//       const result = this.checkCategoryOffer(this.cartItems, this.buyGetPromotion && this.buyGetPromotion.length > 0 ? this.buyGetPromotion : []);
//       console.log(result);
//     });
//   }

//   // private subscribeCart() {
//   //   this.shopService.getCart().subscribe(cart => {
//   //     this.serverCartItems = cart;
//   //     console.log(this.serverCartItems)

//   //     this.cartItems = cart.map((item: any) => ({
//   //       id: item.itemID,
//   //       productID: item.productID,
//   //       name: item.categoryName,

//   //       cartTitle: item.cartTitle,   // 👈 REQUIRED

//   //       weightLabel: `${item.cartTitle.weightNumber} ${item.cartTitle.weightUnit}`,

//   //       originalPrice: item.cartTitle.productPrice,
//   //       salePrice: item.price,

//   //       quantity: item.locqunatity,
//   //       locqunatity: item.locqunatity,

//   //       image: item.cartImage,
//   //       categoryId: item.categoryID,
//   //       subcatId: item.subcatID,
//   //       isFrozen: item.isFrozen || false,

//   //       // ✅ REQUIRED
//   //       isFreeItem: item.isFreeItem || false,
//   //       promoId: item.promoId || null
//   //     }));
//   //     // ✅ CHECK OFFER APPLICABILITY HERE

//   //     console.log(this.cartItems)
//   //     this.isOfferApplicable = this.cartItems.some(item => {
//   //       if (item.isFreeItem) return false;
//   //       if (!this.buyGetPromotion) return false;

//   //       if (this.buyGetPromotion.applicableOn === 'CATEGORY') {
//   //         return this.buyGetPromotion.applicableIds.includes(item.categoryId);
//   //       }

//   //       if (this.buyGetPromotion.applicableOn === 'SUBCATEGORY') {
//   //         return this.buyGetPromotion.applicableIds.includes(item.subcatId);
//   //       }

//   //       return false;
//   //     });
//   //   });
//   //   console.log(this.cartItems)
//   //   console.log("Promo loaded: ", this.buyGetPromotion);
//   //   console.log("isOfferApplicable: ", this.isOfferApplicable);

//   // }
//   // private syncFreeProduct(): void {
//   //   if (!this.buyGetPromotion) return;

//   //   const eligibleQty = this.getEligibleQty();
//   //   const freeQty =
//   //     Math.floor(eligibleQty / this.buyGetPromotion.buyQunatity) *
//   //     this.buyGetPromotion.getQuantity;

//   //   const freeProductId = this.buyGetPromotion.selectFreeProductID;

//   //   const existingFreeItem = this.cartItems.find(
//   //     item => item.productID === freeProductId && item.isFreeItem
//   //   );

//   //   // ❌ Remove free item if no longer eligible
//   //   if (freeQty === 0 && existingFreeItem) {
//   //     this.shopService.removeFromCart(
//   //       existingFreeItem.productID,
//   //       existingFreeItem.cartTitle
//   //     );
//   //     return;
//   //   }

//   //   // ✅ Add or update free product
//   //   if (freeQty > 0) {
//   //     this.shopService.addOrUpdateFreeItem({
//   //       productID: freeProductId,
//   //       locqunatity: freeQty,
//   //       isFreeItem: true,
//   //       promoId: this.buyGetPromotion.promotionID
//   //     });
//   //   }
//   // }
//   // get isOfferApplicable(): boolean {
//   //   if (!this.buyGetPromotion) return false;

//   //   return this.getEligibleQty() < this.buyGetPromotion.buyQunatity;
//   // }

//   // private getEligibleQty(): number {
//   //   if (!this.buyGetPromotion) return 0;

//   //   return this.cartItems
//   //     .filter(item =>
//   //       !item.isFreeItem &&
//   //       this.buyGetPromotion.applicableOn === 'CATEGORY' &&
//   //       this.buyGetPromotion.applicableIds.includes(item.categoryId)
//   //     )
//   //     .reduce((sum, item) => sum + item.locqunatity, 0);
//   // }

//   applyDiscount(): void {
//     this.discountError = '';
//     this.discountAmount = 0;

//     if (!this.discountPromotion) {
//       this.discountError = 'No discount available';
//       return;
//     }

//     if (this.discountCode !== this.discountPromotion.enterCoupanCode) {
//       this.discountError = 'Invalid coupon code';
//       return;
//     }

//     this.discountAmount = this.shopService.calculateDiscountAmount(
//       this.shopService.getCartItems(),
//       this.discountPromotion
//     );

//     if (this.discountAmount > 0) {
//       this.offerApplied = true;
//     } else {
//       this.discountError = 'Coupon not applicable for selected items';
//     }
//   }

//   getItemDiscount(item: CartItem): number {
//     if (!this.offerApplied || !this.discountPromotion) return 0;

//     if (
//       this.discountPromotion.applicableOn === 'SUBCATEGORY' &&
//       this.discountPromotion.applicableIds.includes(item.subcatId)
//     ) {
//       return (
//         (item.salePrice * item.quantity *
//           Number(this.discountPromotion.discountAmountPercentage)) / 100
//       );
//     }

//     return 0;
//   }

//   addAllToCart(items: any[]) {
//   }
//   get totalDiscount(): number {
//     if (!this.offerApplied) return 0;

//     return this.cartItems.reduce(
//       (sum, item) => sum + this.getItemDiscount(item),
//       0
//     );
//   }


//   getTotalItems(): number {
//     return this.cartItems.reduce((total, item) => total + item.quantity, 0)
//   }
//   get subtotal(): number {
//     return this.cartItems.reduce((total, item) => {
//       return total + (Number(item.salePrice || 0) * Number(item.locqunatity || 0));
//     }, 0);
//   }
//   get totalAmount(): number {
//     return (
//       this.subtotal +
//       this.deliveryFee +
//       this.frozenCharge -
//       this.discountAmount
//     );
//   }


//   getTotalItemDiscount(): number {
//     return this.cartItems.reduce((total: number, item: any) => {
//       return total + this.getItemDiscount(item);
//     }, 0);
//   }

//   get totalToPay(): number {
//     return (
//       this.subtotal +
//       this.deliveryFee +
//       this.frozenCharge -
//       this.discountAmount
//     );
//   }

//   get deliveryFee(): number {
//     if (this.subtotal >= this.FREE_DELIVERY_LIMIT) {
//       return 0; // Free delivery
//     }
//     return this.DELIVERY_CHARGE;
//   }
//   get frozenCharge(): number {
//     const hasFrozenItem = this.cartItems.some(item => item.isFrozen);
//     return hasFrozenItem ? this.FROZEN_SURCHARGE : 0;
//   }


//   incrementQuantity(item: CartItem): void {
//     this.shopService.updateItem({
//       productID: item.productID,
//       cartTitle: item.cartTitle, // FULL OBJECT
//       locqunatity: item.locqunatity + 1
//     });
//   }

//   decrementQuantity(item: CartItem): void {
//     if (item.locqunatity > 1) {
//       this.shopService.updateItem({
//         productID: item.productID,
//         cartTitle: item.cartTitle,
//         locqunatity: item.locqunatity - 1
//       });
//     } else {
//       this.shopService.removeFromCart(item.productID, item.cartTitle);
//     }
//   }
//   removeItem(item: CartItem): void {
//     this.shopService.removeFromCart(item.productID, item.cartTitle);
//   }



//   closeCart(): void {
//     //  this.isCartOpen = false;
//     this.closeCartEvent.emit();
//   }

//   checkout(): void {
//     console.log("[v0] Proceeding to checkout")
//     this.closeCartEvent.emit();
//     this.router.navigate(["/checkout"])
//   }

//   navigateToProducts(): void {
//     console.log("[v0] Navigating to products page")
//     this.router.navigate(["/products"])
//   }

//   getBuyGetFreeDiscount(): number {
//     if (!this.buyGetPromotion) return 0;

//     let discount = 0;

//     // this.cartItems.forEach(item => {
//     //   const isApplicable =
//     //     // (this.buyGetPromotion.applicableOn === 'CATEGORY' &&
//     //     //   this.buyGetPromotion.applicableIds.includes(item.categoryId)) ||
//     //     // (this.buyGetPromotion.applicableOn === 'SUBCATEGORY' &&
//     //     //   this.buyGetPromotion.applicableIds.includes(item.subcatId));

//     //   if (!isApplicable) return;

//     //   const totalQty = item.locqunatity;
//     //   const freeQty =
//     //     Math.floor(totalQty / (this.buyGetPromotion.buyQty + this.buyGetPromotion.getQty)) *
//     //     this.buyGetPromotion.getQty;

//     //   discount += freeQty * item.salePrice;
//     // });

//     return discount;
//   }

//   checkCategoryOffer(
//     cart: CartItem[],
//     offerdata: Offer[]
//   ): OfferMessage[] {

//     console.log(cart, offerdata);
//     const messages: OfferMessage[] = [];

//     offerdata.forEach((offer: Offer) => {

//       if (!offer.isActive || offer.applicableOn !== "CATEGORY") return;

//       const applicableCategoryIds: string[] = offer.applicableIds;
//       const buyQty: number = offer.buyQunatity;

//       const matchingItems: CartItem[] = cart.filter(
//         (item: CartItem) =>
//           applicableCategoryIds.includes(item.categoryId) &&
//           !item.isFreeItem
//       );

//       const totalQty: number = matchingItems.length;

//       if (totalQty < buyQty) {
//         const remainingQty: number = buyQty - totalQty;

//         messages.push({
//           promotionID: offer.promotionID,
//           eligible: false,
//           message: `Add ${remainingQty} more product(s) from this category to get ${offer.getQuantity} FREE (${offer.selectFreeProductName})`
//         });

//       } else {
//         messages.push({
//           promotionID: offer.promotionID,
//           eligible: true,
//           message: `🎉 Offer applied! You get ${offer.getQuantity} FREE (${offer.selectFreeProductName})`
//         });
//       }
//     });

//     return messages;
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

/* =======================
   Cart Item Interface
======================= */
export interface CartItems {
  userID?: string;

  itemID?: number;
  productID: string;

  categoryID?: string;
  subcatID?: string;

  categoryName?: string;
  subCategoryName?: string;

  price?: string;
  cartImage?: string;

  cartTitle?: {
    weightNumber: number;
    weightUnit: string;
    productPrice: number;
    disCountProductprice: number;
  };

  qunatity?: number;
  locqunatity: number;

  deliveryDate: number;
  isFrozen?: boolean;
  isFreeItem?: boolean;
  promoId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopsService {

  public proceedCartPayment = new BehaviorSubject<boolean>(false);

  public cartCountItems = new BehaviorSubject<number>(0);
  public cartTotalCount = this.cartCountItems.asObservable();

  public baseUrl: string = 'https://live.maitreyatraderslimited.co.uk';

  private cartItems: CartItems[] = [];
  private cartSubject = new BehaviorSubject<CartItems[]>([]);
  cart$ = this.cartSubject.asObservable();

  private buyGetPromotion: any = null;

  private discountPromotion: any = null;




  constructor(
    private http: HttpClient
  ) {

    const storedCart = localStorage.getItem('cartItems');
    this.cartItems = storedCart ? JSON.parse(storedCart) : [];

    this.buyGetPromotion = JSON.parse(
      localStorage.getItem('BUY_GET_PROMO') || 'null'
    );
    this.discountPromotion = JSON.parse(
      localStorage.getItem('DISCOUNT_PROMO') || 'null'
    );


    this.cartSubject.next(this.cartItems);
    this.updateCount();
  }

  /* =======================
      Helpers
  ======================= */
  private updateCount(): void {
    const totalCount = this.cartItems.reduce(
      (acc, item) => acc + (item.locqunatity || 0),
      0
    );
    this.cartCountItems.next(totalCount);
  }

  private updateLocalStorage2(): void {
    // 1. Save cart
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

    // 2. Apply promo
    if (this.buyGetPromotion) {
      this.buyGetPromotion.forEach((promo: any) => {

        promo.applicableIds.forEach((catid: string) => {

          // Total qty of paid items in that category
          const totalQty = this.cartItems
            .filter(item => item.categoryID === catid && !item.isFreeItem)
            .reduce((sum, item) => sum + Number(item.locqunatity), 0);

          // Free qty calculation
          const freeQty = Math.floor(totalQty / promo.buyQunatity) * promo.getQuantity;

          // Add or update free item
          this.addOrUpdateFreeItem({
            productID: promo.pID,
            locqunatity: freeQty,
            isFreeItem: true,
            promoId: promo.promotionID,
            pdname: promo.selectFreeProductName
          });
        });
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]); // trigger change detection
    this.updateCount();

  }


  private updateLocalStorage(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    let result: any = [];
    console.log(this.buyGetPromotion);
    console.log(this.cartItems)

    // result = this.checkCategoryOffer(this.cartItems, this.buyGetPromotion);

    if (this.buyGetPromotion) {
      this.buyGetPromotion.forEach((free: any) => {
        free.applicableIds.forEach((catId: any) => {

          // 1️⃣ calculate total quantity for matching catid
          const totalQty = this.cartItems
            .filter(item => item.categoryID === catId)
            .reduce((sum, item) => sum + Number(item.locqunatity), 0);

          console.log(totalQty, free)
          // 2️⃣ check buy condition
          if (totalQty >= free.buyQunatity) {

            // 3️⃣ check if free item already exists
            const exists = this.cartItems.some(
              item => item.productID === free.selectFreeProductID && item.categoryID === catId
            );



            if (!exists) {
              this.cartItems.push({
                itemID: Date.now(),
                productID: free.selectFreeProductID,
                categoryID: catId,
                subcatID: '',
                categoryName: free.selectFreeProductName,
                cartTitle: {
                  weightNumber: 1,
                  weightUnit: 'pc',
                  productPrice: 0,
                  disCountProductprice: 0
                },
                price: "0",
                locqunatity: 1,
                cartImage: '../../../assets/panner.webp',
                deliveryDate: Date.now(),
                isFrozen: false,
                isFreeItem: true,
                promoId: free.promotionID
              });
            }
          }
        });
      });

      // this.buyGetPromotion.forEach((free: any) => {
      //   free.applicableIds.forEach((catid: string) => {

      //     // sum locquantiry for matching catid
      //     const totalQty = this.cartItems
      //       .filter(item => item.categoryID === catid)
      //       .reduce((sum, item) => sum + Number(item.locqunatity), 0);

      //     // check buy quantity condition
      //     if (totalQty >= free.buyQunatity) {
      //       console.log(free)
      //       result.push({
      //         // pid: free.pID,
      //         // pname: free.pname
      //         itemID: Date.now(),
      //         productID: free.productID,
      //         categoryID: free.applicableIds,
      //         subcatID: '',
      //         categoryName: free.pdname,
      //         cartTitle: {
      //           weightNumber: 1,
      //           weightUnit: 'pc',
      //           productPrice: 0,
      //           disCountProductprice: 0
      //         },
      //         price: 0,
      //         locqunatity: 1,
      //         cartImage: '../../../assets/panner.webp',
      //         deliveryDate: Date.now(),
      //         isFrozen: false,
      //         isFreeItem: true,
      //         promoId: free.promoId
      //       });
      //     }
      //   });
      // });
    }
    console.log(this.cartItems);
    // result.filter((items: any) => {
    //   this.cartItems.push(items)
    // })
    // const existingPids = new Set(result.map((item: any) => item.pid));
    // this.cartItems = [
    //   ...this.cartItems,
    //   ...result.filter((item: any) => !existingPids.has(item.pid))
    // ];
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

    this.cartSubject.next([...this.cartItems]); // trigger change detection
    this.updateCount();
  }


  checkCategoryOffer(
    cart: any[],
    offerdata: any[]
  ): any[] {

    const messages: any[] = [];

    offerdata.forEach((offer: any) => {

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

  /* =======================
      Get Cart
  ======================= */
  getCart() {
    return this.cartSubject.asObservable();
  }


  setDiscountPromotion(promo: any) {
    this.discountPromotion = promo;
    localStorage.setItem('DISCOUNT_PROMO', JSON.stringify(promo));
  }

  getDiscountPromotion() {
    return this.discountPromotion;
  }

  /* =======================
      Add To Cart
  ======================= */
  addToCart(product: any): void {
    const stored = localStorage.getItem('cartItems');
    this.cartItems = stored ? JSON.parse(stored) : [];

    const w = product.selectedWeight;
    if (!w) return;

    const existing = this.cartItems.find(i =>
      i.productID === product.productID &&
      i.cartTitle?.weightNumber === w.weightNumber &&
      i.cartTitle?.weightUnit === w.weightUnit
    );

    if (existing) {
      existing.locqunatity += 1;
    } else {
      this.cartItems.push({
        itemID: Date.now(),
        productID: product.productID,
        categoryID: product.categoryId,
        subcatID: product.subcatId,
        categoryName: product.name,
        price: product.price,
        cartImage: product.image,
        isFrozen: product.isFrozen || false,

        cartTitle: {
          weightNumber: w.weightNumber,
          weightUnit: w.weightUnit,
          productPrice: w.productPrice,
          disCountProductprice: w.disCountProductprice
        },

        qunatity: 1,
        locqunatity: 1,
        deliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000
      });
    }

    this.updateLocalStorage();
  }

  /* =======================
      Update Quantity
  ======================= */
  updateItem(data: {
    productID: string;
    cartTitle: { weightNumber: number; weightUnit: string };
    locqunatity: number;
  }): void {

    const stored = localStorage.getItem('cartItems');
    this.cartItems = stored ? JSON.parse(stored) : [];

    const item = this.cartItems.find(i =>
      i.productID === data.productID &&
      i.cartTitle?.weightNumber === data.cartTitle.weightNumber &&
      i.cartTitle?.weightUnit === data.cartTitle.weightUnit
    );

    if (item) {
      item.locqunatity = data.locqunatity;
    }

    this.updateLocalStorage();
  }

  /* =======================
      Remove Item
  ======================= */
  removeFromCart(
    productID: string,
    cartTitle: { weightNumber: number; weightUnit: string }
  ): void {

    this.cartItems = this.cartItems.filter(item =>
      !(
        item.productID === productID &&
        item.cartTitle?.weightNumber === cartTitle.weightNumber &&
        item.cartTitle?.weightUnit === cartTitle.weightUnit
      )
    );

    this.updateLocalStorage();
  }

  /* =======================
      Clear Cart
  ======================= */
  clearCart(): void {
    this.cartItems = [];
    this.updateLocalStorage();
  }

  /* =======================
      Totals
  ======================= */
  getTotalPrice(): number {
    return this.cartItems.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * item.locqunatity,
      0
    );
  }

  getCartItems(): CartItems[] {
    const stored = localStorage.getItem('cartItems');
    this.cartItems = stored ? JSON.parse(stored) : [];
    return this.cartItems;
  }

  setBuyGetPromotion(promo: any) {
    console.log(promo)
    this.buyGetPromotion = promo;
    localStorage.setItem('BUY_GET_PROMO', JSON.stringify(promo));
  }
  addOrUpdateFreeItem(payload: {
    productID: string;
    locqunatity: number;
    isFreeItem: boolean;
    promoId: string;
    pdname: string
  }): void {

    const cart = this.cartItems;   // use cartItems NOT cartSubject

    const existingFreeItemIndex = cart.findIndex(
      (item: any) =>
        item.productID === payload.productID &&
        item.isFreeItem === true
    );

    if (payload.locqunatity === 0 && existingFreeItemIndex !== -1) {
      cart.splice(existingFreeItemIndex, 1);
      return;
    }

    if (existingFreeItemIndex !== -1) {
      cart[existingFreeItemIndex] = {
        ...cart[existingFreeItemIndex],
        locqunatity: payload.locqunatity,
        price: '0',
        isFreeItem: true,
        promoId: payload.promoId
      };
      return;
    }

    cart.push({
      itemID: Date.now(),
      productID: payload.productID,
      categoryID: '',
      subcatID: '',
      categoryName: payload.pdname,
      cartTitle: {
        weightNumber: 1,
        weightUnit: 'pc',
        productPrice: 0,
        disCountProductprice: 0
      },
      price: '0',
      locqunatity: payload.locqunatity,
      cartImage: '../../../assets/panner.webp',
      deliveryDate: Date.now(),
      isFrozen: false,
      isFreeItem: true,
      promoId: payload.promoId
    });


  }



}


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';

// interface CartItems {
//   userID?: string;
//   categoryID?: string;
//   itemID?: number;
//   subcatID?: string;
//   qunatity?: number;
//   locqunatity: number;
//   price?: string;
//   size?: string;
//   cartImage?: string;
//   cartTitle?: {
//     weightNumber: number;
//     weightUnit: string;
//     productPrice: number;
//     disCountProductprice: number;
//   };

//   packetSize?: string;
//   categoryName?: string;
//   subCategoryName?: string;
//   deliveryDate: number;
//   productID: string;
//   isFrozen?: boolean;

//   // 🔥 ADD
//   isFreeItem?: boolean;
//   promoId?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ShopsService {
//   public proceedCartPayment = new BehaviorSubject(false);
//   public cartCountItems: BehaviorSubject<number> = new BehaviorSubject<number>(0);
//   public cartTotalCount = this.cartCountItems.asObservable();
//   public addcartItems: any[] = [];
//   public allCategoriesList: Array<any> = [];
//   public baseUrl: string = "https://live.maitreyatraderslimited.co.uk";
//   private cartItems: CartItems[] = [];
//   public cartLoginItems: CartItems[] = [];
//   private cartSubject = new BehaviorSubject<CartItems[]>([]);
//   // private apiKey = 'f66cef6f89c7b0675408ba6f239a6c78';
//   // private apiUrl = 'https://api.currencyapi.com/v3/latest';

//   cart$ = this.cartSubject.asObservable();
//   cartCount$ = this.cartCountItems.asObservable();

//   private buyGetPromotion: any = null;

//   private discountPromotion: any = null;


//   constructor(
//     private http: HttpClient
//   ) {

//     const storedCart = localStorage.getItem('cartItems');
//     this.cartItems = storedCart ? JSON.parse(storedCart) : [];

//     this.buyGetPromotion = JSON.parse(
//       localStorage.getItem('BUY_GET_PROMO') || 'null'
//     );
//     this.discountPromotion = JSON.parse(
//       localStorage.getItem('DISCOUNT_PROMO') || 'null'
//     );


//     this.cartSubject.next(this.cartItems);
//     this.updateCount();
//   }
//   private updateCount() {
//     const totalCount = this.cartItems.reduce(
//       (acc, item) => acc + (item.locqunatity || 0),
//       0
//     );
//     this.cartCountItems.next(totalCount);
//   }

//   getCart() {
//     return this.cartSubject.asObservable();
//   }


//   private updateLocalStorage() {
//     localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
//     this.cartSubject.next([...this.cartItems]); // spread = change detection
//     this.updateCount();
//   }
//   addToCart(product: any) {
//     const stored = localStorage.getItem('cartItems');
//     this.cartItems = stored ? JSON.parse(stored) : [];

//     const w = product.selectedWeight;

//     const existing = this.cartItems.find(i =>
//       i.productID === product.productID &&
//       i.cartTitle?.weightNumber === w.weightNumber &&
//       i.cartTitle?.weightUnit === w.weightUnit &&
//       !i.isFreeItem
//     );

//     if (existing) {
//       existing.locqunatity += 1;
//     } else {
//       this.cartItems.push({
//         itemID: product.productID,
//         productID: product.productID,
//         categoryID: product.categoryId,
//         subcatID: product.subcatId,
//         categoryName: product.name,

//         price: product.price,
//         cartImage: product.image,

//         cartTitle: {
//           weightNumber: w.weightNumber,
//           weightUnit: w.weightUnit,
//           productPrice: w.productPrice,
//           disCountProductprice: w.disCountProductprice
//         },

//         locqunatity: 1,
//         deliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
//         isFreeItem: false // ✅ EXPLICIT
//       });
//     }
//     this.cartSubject.next(this.cartItems);
//     // 🔥 APPLY BUY-GET HERE
//     this.applyBuyGetOffer();

//     this.updateLocalStorage();
//   }

//   updateItem(data: any) {
//     const stored = localStorage.getItem('cartItems');
//     this.cartItems = stored ? JSON.parse(stored) : [];

//     const item = this.cartItems.find(i =>
//       i.productID === data.productID &&
//       i.cartTitle?.weightNumber === data.cartTitle.weightNumber &&
//       i.cartTitle?.weightUnit === data.cartTitle.weightUnit &&
//       !i.isFreeItem
//     );

//     if (item) {
//       item.locqunatity = data.locqunatity;
//     }

//     this.applyBuyGetOffer();
//     this.updateLocalStorage();
//   }
//   removeFromCart(productID: string, cartTitle: any) {
//     this.cartItems = this.cartItems.filter(item =>
//       !(
//         item.productID === productID &&
//         item.cartTitle?.weightNumber === cartTitle.weightNumber &&
//         item.cartTitle?.weightUnit === cartTitle.weightUnit &&
//         !item.isFreeItem
//       )
//     );

//     this.applyBuyGetOffer();
//     this.updateLocalStorage();
//   }

//   clearCart() {
//     this.cartItems = [];
//     this.updateLocalStorage();
//   }

//   getTotalPrice(): number {
//     return this.cartItems.reduce((sum, item) => sum + Number(item.price) * item.locqunatity, 0);
//   }

//   getCartItems(): CartItems[] {
//     const stored = localStorage.getItem('cartItems');
//     this.cartItems = stored ? JSON.parse(stored) : [];
//     return this.cartItems;
//   }

//   setBuyGetPromotion(promo: any) {
//     console.log(promo)
//     this.buyGetPromotion = promo;
//     localStorage.setItem('BUY_GET_PROMO', JSON.stringify(promo));
//   }

//   // private getEligibleQty(): number {
//   //   if (!this.buyGetPromotion) return 0;

//   //   return this.cartItems
//   //     .filter(item =>
//   //       !item.isFreeItem &&
//   //       this.buyGetPromotion.applicableOn === 'CATEGORY' &&
//   //       this.buyGetPromotion.applicableIds.includes(item.categoryID)
//   //     )
//   //     .reduce((sum, item) => sum + item.locqunatity, 0);
//   // }

//   private getEligibleQty(): number {
//   if (!this.buyGetPromotion) return 0;

//   return this.cartItems
//     .filter(item =>
//       !item.isFreeItem &&
//       this.buyGetPromotion.applicableOn === 'CATEGORY' &&
//       this.buyGetPromotion.applicableIds.includes(item.categoryID)
//     )
//     .reduce((sum, item) => sum + item.locqunatity, 0);
// }
// private getFreeQty(): number {
//   if (!this.buyGetPromotion) return 0;

//   return Math.floor(
//     this.getEligibleQty() / this.buyGetPromotion.buyQunatity
//   ) * this.buyGetPromotion.getQuantity;
// }


//   private applyBuyGetOffer(): void {
//     if (!this.buyGetPromotion) return;

//     const cart = [...this.cartSubject.value]; // clone array
//     const freeQty = this.getFreeQty();

//     const freeIndex = cart.findIndex(
//       i =>
//         i.isFreeItem &&
//         i.productID === this.buyGetPromotion.selectFreeProductID
//     );

//     // ❌ REMOVE FREE ITEM
//     if (freeQty === 0 && freeIndex !== -1) {
//       cart.splice(freeIndex, 1);
//       this.cartSubject.next(cart);
//       return;
//     }

//     // ✅ UPDATE FREE ITEM QTY
//     if (freeIndex !== -1) {
//       cart[freeIndex] = {
//         ...cart[freeIndex],
//         locqunatity: freeQty
//       };
//       this.cartSubject.next(cart);
//       return;
//     }

//     // ✅ ADD FREE ITEM
//     if (freeQty > 0) {
//       cart.push({
//         itemID: Date.now(),
//         productID: this.buyGetPromotion.selectFreeProductID,
//         categoryName: this.buyGetPromotion.selectFreeProductName,
//         cartImage: this.buyGetPromotion.freeProductImage || '',
//         cartTitle: {
//           weightNumber: 0,
//           weightUnit: '',
//           productPrice: 0,
//           disCountProductprice: 0
//         },
//         price: freeQty > 0 ? '0' : '0',
//         deliveryDate: Date.now(),
//         locqunatity: freeQty,
//         isFreeItem: true,
//         promoId: this.buyGetPromotion.promotionID,
//         categoryID: '',
//         subcatID: '',
//         isFrozen: false
//       });

//       this.cartSubject.next(cart);
//     }
//   }
// addOrUpdateFreeItem(payload: {
//   productID: string;
//   locqunatity: number;
//   isFreeItem: boolean;
//   promoId: string;
// }): void {

//   const cart = this.cartSubject.getValue();

//   const existingFreeItemIndex = cart.findIndex(
//     (item: any) =>
//       item.productID === payload.productID &&
//       item.isFreeItem === true
//   );

//   // ❌ Remove if qty is zero
//   if (payload.locqunatity === 0 && existingFreeItemIndex !== -1) {
//     cart.splice(existingFreeItemIndex, 1);
//     this.cartSubject.next([...cart]);
//     return;
//   }

//   // ✅ Update existing free item
//   if (existingFreeItemIndex !== -1) {
//     cart[existingFreeItemIndex] = {
//       ...cart[existingFreeItemIndex],
//       locqunatity: payload.locqunatity,
//       price: '0',
//       isFreeItem: true,
//       promoId: payload.promoId
//     };

//     this.cartSubject.next([...cart]);
//     return;
//   }

//   // ✅ Add new free item
//   cart.push({
//     itemID: Date.now(),
//     productID: payload.productID,
//     categoryID: '',         // not required for free product
//     subcatID: '',
//     categoryName: 'FREE ITEM',
//     cartTitle: {
//       weightNumber: 1,
//       weightUnit: 'pc',
//       productPrice: 0,
//       disCountProductprice: 0
//     },
//     price: '0',
//     locqunatity: payload.locqunatity,
//     cartImage: 'assets/free-product.png',
//     deliveryDate: Date.now(),
//     isFrozen: false,
//     isFreeItem: true,
//     promoId: payload.promoId
//   });

//   this.cartSubject.next([...cart]);
// }

//   private isProductEligibleForPromo(product: any, promo: any): boolean {
//     if (!promo) return false;

//     if (promo.applicableOn === "CATEGORY") {
//       return promo.applicableIds.includes(product.categoryID);
//     }

//     if (promo.applicableOn === "SUBCATEGORY") {
//       return promo.applicableIds.includes(product.subCategoryID);
//     }

//     return false;
//   }


//   setDiscountPromotion(promo: any) {
//     this.discountPromotion = promo;
//     localStorage.setItem('DISCOUNT_PROMO', JSON.stringify(promo));
//   }

//   getDiscountPromotion() {
//     return this.discountPromotion;
//   }



//   calculateDiscountAmount(cartItems: any[], promo: any): number {
//     let discount = 0;
//     const percentage = Number(promo.discountAmountPercentage);

//     cartItems.forEach(item => {
//       if (
//         promo.applicableOn === 'SUBCATEGORY' &&
//         promo.applicableIds.includes(item.subcatID)
//       ) {
//         discount += (Number(item.price) * item.locqunatity * percentage) / 100;
//       }
//     });

//     return discount;
//   }



//   // addToCart(product: any) {
//   //   const stored = localStorage.getItem('cartItems');
//   //   this.cartItems = stored ? JSON.parse(stored) : [];

//   //   const w = product.selectedWeight;

//   //   const existing = this.cartItems.find(i =>
//   //     i.productID === product.productID &&
//   //     i.cartTitle?.weightNumber === w.weightNumber &&
//   //     i.cartTitle?.weightUnit === w.weightUnit
//   //   );

//   //   if (existing) {
//   //     existing.locqunatity += 1;
//   //   } else {
//   //     this.cartItems.push({
//   //       itemID: product.productID,
//   //       productID: product.productID,
//   //       categoryID: product.categoryId,
//   //       subcatID: product.subcatId,
//   //       categoryName: product.name,

//   //       price: product.price,
//   //       cartImage: product.image,

//   //       // ✅ KEEP cartTitle
//   //       cartTitle: {
//   //         weightNumber: w.weightNumber,
//   //         weightUnit: w.weightUnit,
//   //         productPrice: w.productPrice,
//   //         disCountProductprice: w.disCountProductprice
//   //       },

//   //       qunatity: 1,
//   //       locqunatity: 1,
//   //       deliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000
//   //     });
//   //   }

//   //   this.updateLocalStorage();
//   // }

//   // updateItem(data: {
//   //   productID: string;
//   //   cartTitle: {
//   //     weightNumber: number;
//   //     weightUnit: string;
//   //   };
//   //   locqunatity: number;
//   // }) {
//   //   const stored = localStorage.getItem('cartItems');
//   //   this.cartItems = stored ? JSON.parse(stored) : [];

//   //   const item = this.cartItems.find(i =>
//   //     i.productID === data.productID &&
//   //     i.cartTitle?.weightNumber === data.cartTitle.weightNumber &&
//   //     i.cartTitle?.weightUnit === data.cartTitle.weightUnit
//   //   );

//   //   if (item) {
//   //     item.locqunatity = data.locqunatity;
//   //   }

//   //   this.updateLocalStorage();
//   // }
//   // removeFromCart(
//   //   productID: string,
//   //   cartTitle: { weightNumber: number; weightUnit: string }
//   // ) {
//   //   this.cartItems = this.cartItems.filter(item =>
//   //     !(
//   //       item.productID === productID &&
//   //       item.cartTitle?.weightNumber === cartTitle.weightNumber &&
//   //       item.cartTitle?.weightUnit === cartTitle.weightUnit
//   //     )
//   //   );

//   //   this.updateLocalStorage();
//   // }


// }


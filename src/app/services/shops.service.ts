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

  private FreeItmCatID: string = ""
  private FreeItmSubID: string = ""
  private FreeProImage: string = ""


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

    const FreeItmmSubID = localStorage.getItem('ForFreeItmSubID');

    const FreeImmage = localStorage.getItem('ForFreeImg');

    if (FreeItmmSubID) {
      this.FreeItmSubID = FreeItmmSubID;
    }

    if (FreeImmage) {
      this.FreeProImage = FreeImmage;
    }

    console.log(this.FreeProImage, this.FreeItmSubID);

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



  private updateLocalStorage(): void {
    const FreeItmmSubID = localStorage.getItem('ForFreeItmSubID');
    const FreeImmage = localStorage.getItem('ForFreeImg');
    if (FreeItmmSubID) {
      this.FreeItmSubID = FreeItmmSubID;
    }
    if (FreeImmage) {
      this.FreeProImage = FreeImmage;
    }
    console.log(this.FreeProImage, this.FreeItmSubID);

    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    let result: any = [];
    console.log(this.buyGetPromotion);
    console.log(this.cartItems)


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
                // subcatID: '',
                subcatID: this.FreeItmSubID,
                categoryName: free.selectFreeProductName,
                cartTitle: {
                  weightNumber: 1,
                  weightUnit: 'pc',
                  productPrice: 0,
                  disCountProductprice: 0
                },
                price: "0",
                locqunatity: 1,
                // cartImage: '../../../assets/panner.webp',
                cartImage: this.FreeProImage,
                deliveryDate: Date.now(),
                isFrozen: false,
                isFreeItem: true,
                promoId: free.promotionID
              });
            }
          } else {
            const exists = this.cartItems.some(
              item => item.productID === free.selectFreeProductID && item.categoryID === catId
            );
            if (exists) {
              this.cartItems = this.cartItems.filter(item =>
                !(
                  item.productID === free.selectFreeProductID
                )
              );
            }
          }
        });
      });


    }
    console.log(this.cartItems);
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

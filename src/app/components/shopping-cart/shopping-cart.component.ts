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

  cartItems: CartItem[] = [];
  serverCartItems: any[] = [];

  /* ===== Charges ===== */
  MIN_ORDER_AMOUNT = 35;
  FREE_DELIVERY_LIMIT = 80;
  DELIVERY_CHARGE = 5.99;
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
    // this.GetHomepageData();
    this.subscribeCart();

    let buygetxy = localStorage.getItem('BUY_GET_PROMO');
    if (buygetxy) {
      this.buyGetPromotion = JSON.parse(buygetxy);
    }
    console.log(this.buyGetPromotion)


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
    this.openSnackBar('Added to cart successfully', '');

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
    // localStorage.setItem('Discount', this.discountAmount.toString())
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
      this.subtotal
      + this.deliveryFee
      + this.frozenCharge
      - this.discountAmount
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
  // openSnackBar(message: string, action: string) {
  //   this.snackBar.open(message, action, {
  //     duration: 3000,
  //     panelClass: "red-snackbar",
  //   });
  // }


  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['center-snackbar'],
      horizontalPosition: 'center'
    });
  }
  GetHomepageData() {
    this.CustomerService.showLoader.next(true);

    this.CustomerService.HomepageData().subscribe(
      (posRes: any) => {
        console.log(posRes);

        if (posRes.response === 3) {
          const promo = JSON.parse(localStorage.getItem('BUY_GET_PROMO') || 'null');

          const buyGetPromos = posRes.BuyGetPromotions_Data?.filter(
            (p: any) => p.isActive === true
          ) || [];

          console.log("BUY GET PROMOS >>>", buyGetPromos);
          /* Store or remove promo */
          if (buyGetPromos.length) {
            this.shopService.setBuyGetPromotion(buyGetPromos);
          } else {
            localStorage.removeItem('BUY_GET_PROMO');
          }

          const discountPromo = posRes.DiscountPromotions_Data?.filter(
            (p: any) => p.isActive === true
          ) || [];


          if (discountPromo) {
            this.shopService.setDiscountPromotion(discountPromo);
          }

          console.log("discountPromo >>>", discountPromo);
          this.CustomerService.showLoader.next(false);

        } else {
          this.openSnackBar(posRes.message, '');
          this.CustomerService.showLoader.next(false);
        }
      },
      (err) => {
        this.openSnackBar(err.message, '');
        this.CustomerService.showLoader.next(false);
        console.warn(err.error);
      }
    );
  }

}





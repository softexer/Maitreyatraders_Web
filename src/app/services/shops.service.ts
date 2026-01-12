import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
// import { CartItems } from '../../app/model/cart-items'
interface CartItems {
  userID?: string;
  categoryID?: string;
  // itemID?: string;
  itemID?: number;
  subcatID?: string;
  qunatity?: number;
  locqunatity: number;
  price?: string;
  size?: string;
  cartImage?: string;
  // cartTitle?: string;
  cartTitle?: {
    weightNumber: number;
    weightUnit: string;
    productPrice: number;
    disCountProductprice: number;
  };

  packetSize?: string;
  categoryName?: string;
  subCategoryName?: string;
  deliveryDate: number;
  productID: string
}

@Injectable({
  providedIn: 'root'
})
export class ShopsService {
  public proceedCartPayment = new BehaviorSubject(false);
  public cartCountItems: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public cartTotalCount = this.cartCountItems.asObservable();
  public addcartItems: any[] = [];
  public allCategoriesList: Array<any> = [];
  public baseUrl: string = "http://18.205.217.76:3000";
  private cartItems: CartItems[] = [];
  public cartLoginItems: CartItems[] = [];
  private cartSubject = new BehaviorSubject<CartItems[]>([]);
  // private apiKey = 'f66cef6f89c7b0675408ba6f239a6c78';
  // private apiUrl = 'https://api.currencyapi.com/v3/latest';

  cart$ = this.cartSubject.asObservable();
  cartCount$ = this.cartCountItems.asObservable();

  constructor(
    private http: HttpClient
  ) {
    // const storedCart = localStorage.getItem('cartItems');
    // if (storedCart) {
    //   this.cartItems = JSON.parse(storedCart);
    //   this.cartSubject.next(this.cartItems);
    //   const totalCount = this.cartItems.reduce((acc, item) => acc + item.locqunatity, 0);
    //   this.cartCountItems.next(totalCount);
    // }
    const storedCart = localStorage.getItem('cartItems');
    this.cartItems = storedCart ? JSON.parse(storedCart) : [];

    this.cartSubject.next(this.cartItems);
    this.updateCount();
  }
  private updateCount() {
    const totalCount = this.cartItems.reduce(
      (acc, item) => acc + (item.locqunatity || 0),
      0
    );
    this.cartCountItems.next(totalCount);
  }

  getCart() {
    return this.cartSubject.asObservable();
  }


  private updateLocalStorage() {
    // localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    // this.cartSubject.next(this.cartItems);

    // const totalCount = this.cartItems.reduce(
    //   (acc, item) => acc + item.locqunatity,
    //   0
    // );

    // this.cartCountItems.next(totalCount);

    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]); // spread = change detection
    this.updateCount();
  }

  addToCart(product: any) {
  const stored = localStorage.getItem('cartItems');
  this.cartItems = stored ? JSON.parse(stored) : [];

  const w = product.selectedWeight;

  const existing = this.cartItems.find(i =>
    i.productID === product.productID &&
    i.cartTitle?.weightNumber === w.weightNumber &&
    i.cartTitle?.weightUnit === w.weightUnit
  );

  if (existing) {
    existing.locqunatity += 1;
  } else {
    this.cartItems.push({
      itemID: product.productID,
      productID: product.productID,
      categoryID: product.categoryId,
      subcatID: product.subcatId,
      categoryName: product.name,

      price: product.price,
      cartImage: product.image,

      // ✅ KEEP cartTitle
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

updateItem(data: {
  productID: string;
  cartTitle: {
    weightNumber: number;
    weightUnit: string;
  };
  locqunatity: number;
}) {
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
removeFromCart(
  productID: string,
  cartTitle: { weightNumber: number; weightUnit: string }
) {
  this.cartItems = this.cartItems.filter(item =>
    !(
      item.productID === productID &&
      item.cartTitle?.weightNumber === cartTitle.weightNumber &&
      item.cartTitle?.weightUnit === cartTitle.weightUnit
    )
  );

  this.updateLocalStorage();
}


  // addToCart(product: any) {
  //   console.log(product)
  //   const stored = localStorage.getItem('cartItems');
  //   this.cartItems = stored ? JSON.parse(stored) : [];

  //   // 🔑 UNIQUE MATCH (IMPORTANT)
  //   // const existing = this.cartItems.find(i =>
  //   //   i.productID === product.productID &&
  //   //   i.cartTitle === product.selectedWeight
  //   // );
  //   const existing = this.cartItems.find(i =>
  //     i.productID === product.productID &&
  //     i.cartTitle?.weightNumber === product.selectedWeight.weightNumber &&
  //     i.cartTitle?.weightUnit === product.selectedWeight.weightUnit
  //   );
  //   if (existing) {
  //     existing.locqunatity += 1;
  //   } else {
  //     this.cartItems.push({
  //       // ⚠️ itemID is NOT used for matching anymore
  //       // itemID: product.productID,              // optional, keep if backend needs
  //       // productID: product.productID,            // ✅ MUST MATCH PRODUCT
  //       // categoryID: product.categoryId,
  //       // subcatID: product.subcatId,
  //       // categoryName: product.name,
  //       // price: product.originalPrice,
  //       // cartImage: product.image,
  //       // cartTitle: product.selectedWeight,       // ✅ weight
  //       // qunatity: 1,
  //       // locqunatity: 1,
  //       // deliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000
  //       itemID: product.productID,
  //       productID: product.productID,
  //       categoryID: product.categoryId,
  //       subcatID: product.subcatId,
  //       categoryName: product.name,
  //       // price: product.selectedWeight.productPrice,

  //       // price:
  //       //   product.selectedWeight.disCountProductprice > 0
  //       //     ? product.selectedWeight.productPrice -
  //       //     product.selectedWeight.disCountProductprice
  //       //     : product.selectedWeight.productPrice,

  //       price: product.price,


  //       cartImage: product.image,
  //       cartTitle: product.selectedWeight, // keep full object
  //       qunatity: 1,
  //       locqunatity: 1,
  //       deliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000
  //     });
  //   }

  //   // ✅ SINGLE SOURCE UPDATE
  //   localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  //   this.cartSubject.next(this.cartItems);

  //   const total = this.cartItems.reduce((s, i) => s + i.locqunatity, 0);
  //   this.cartCountItems.next(total);
  // }

  // updateItem(data: {
  //   productID: string;
  //   cartTitle: {
  //     weightNumber: number;
  //     weightUnit: string;
  //   };
  //   locqunatity: number;
  // }) {
  //   const stored = localStorage.getItem('cartItems');
  //   this.cartItems = stored ? JSON.parse(stored) : [];

  //   // const item = this.cartItems.find(i =>
  //   //   i.productID === data.productID &&
  //   //   i.cartTitle === data.cartTitle
  //   // );

  //   // if (item) {
  //   //   item.locqunatity = data.locqunatity;
  //   // }
  //   const item = this.cartItems.find(i =>
  //     i.productID === data.productID &&
  //     i.cartTitle?.weightNumber === data.cartTitle.weightNumber &&
  //     i.cartTitle?.weightUnit === data.cartTitle.weightUnit
  //   );

  //   if (item) {
  //     item.locqunatity = data.locqunatity;
  //   }


  //   localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  //   this.cartSubject.next(this.cartItems);


  // }

  // removeFromCart(
  //   productID: string,
  //   cartTitle: { weightNumber: number; weightUnit: string }
  // ) {
  //   this.cartItems = this.cartItems.filter(item =>
  //     !(
  //       item.productID === productID &&
  //       item.cartTitle?.weightNumber === cartTitle.weightNumber &&
  //       item.cartTitle?.weightUnit === cartTitle.weightUnit
  //     )
  //   );

  //   this.updateLocalStorage(); // 🔥 REQUIRED
  // }
  clearCart() {
    this.cartItems = [];
    this.updateLocalStorage();
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + Number(item.price) * item.locqunatity, 0);
  }

  getCartItems(): CartItems[] {
    const stored = localStorage.getItem('cartItems');
    this.cartItems = stored ? JSON.parse(stored) : [];
    return this.cartItems;
  }



}


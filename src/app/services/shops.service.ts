import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
// import { CartItems } from '../../app/model/cart-items'
interface CartItems {
  userID?: string;
  categoryID?: string;
  itemID?: string;
  subcatID?: string;
  qunatity?: number;
  locqunatity: number;
  price?: string;
  size?: string;
  cartImage?: string;
  cartTitle?: string;
  packetSize?: string;
  categoryName?: string;
  subCategoryName?: string;
  // deliveryDate: string;
  deliveryDate: number;
   productID: string
  // typeOfBook: "Journals" | "BookStore" | "SchoolZone" | "ScientficSupplies";
  // booksList?: BookItem[];
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
  public baseUrl: string = "http://192.168.1.16:3000";
  private cartItems: CartItems[] = [];
  public cartLoginItems: CartItems[] = [];
  private cartSubject = new BehaviorSubject<CartItems[]>([]);
  // private apiKey = 'f66cef6f89c7b0675408ba6f239a6c78';
  // private apiUrl = 'https://api.currencyapi.com/v3/latest';

  constructor(
    private http: HttpClient
  ) {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
      this.cartSubject.next(this.cartItems);
      const totalCount = this.cartItems.reduce((acc, item) => acc + item.locqunatity, 0);
      this.cartCountItems.next(totalCount);
    }
  }

  getCart() {
    return this.cartSubject.asObservable();
  }
  updateCartCountFromApi(cartData: any[]) {
    const totalCount = cartData.reduce((sum, item) => {
      return item.typeOfBook !== 'SchoolZone' ? sum + item.qunatity : sum + 1;
    }, 0);
    this.cartCountItems.next(totalCount);
  }

  private updateLocalStorage() {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
    // Recalculate total quantity
    const totalCount = this.cartItems.reduce((acc, item) => acc + item.locqunatity, 0);
    this.cartCountItems.next(totalCount);
  }


  addToCart(product: any) {
    const stored = localStorage.getItem('cartItems');
    this.cartItems = stored ? JSON.parse(stored) : [];

    const itemId = product.itemID || product.bookstoreID || product.id;

    const existing = this.cartItems.find(i => i.itemID === itemId);

    if (existing) {
      existing.locqunatity = (existing.locqunatity || 0) + 1;
    } else {
      this.cartItems.push({
        itemID: itemId,
        categoryID: product.categoryId,
        subcatID: product.subcatId,
         productID: product.productID,
        qunatity: 1,
        locqunatity: 1,
        categoryName: product.name,
        price: product.price,
        cartImage: product.image,
        cartTitle: product.type,
        deliveryDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).getTime()
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

    const total = this.cartItems.reduce(
      (s, i) => s + (i.locqunatity || 0),
      0
    );

    this.cartCountItems.next(total);
  }

  updateItem(updatedItem: any) {
    const index = this.cartItems.findIndex(item => item.itemID === updatedItem.itemID);
    if (index !== -1) {
      this.cartItems[index] = { ...updatedItem };
      this.updateLocalStorage();
    }
  }
  removeFromCart(productId: string) {
    this.cartItems = this.cartItems.filter(p => p.itemID !== productId);
    this.updateLocalStorage();
  }

  clearCart() {
    this.cartItems = [];
    this.updateLocalStorage();
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + Number(item.price) * item.locqunatity, 0);
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
  private saveCartItems(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.addcartItems));
  }
  // getCartItems(): any[] {
  //   return this.addcartItems;
  // }

  getCartItems(): CartItems[] {
    const stored = localStorage.getItem('cartItems');
    this.cartItems = stored ? JSON.parse(stored) : [];
    return this.cartItems;
  }


}


import { Component, EventEmitter, Input, Output } from "@angular/core"
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ShopsService } from "src/app/services/shops.service";
import { MaitreyaCustomerService } from "src/app/services/maitreya-customer.service";


// interface CartItem {
//   id: number
//   name: string
//   weight: string
//   originalPrice: number
//   salePrice: number
//   quantity: number
//   locqunatity: number
//   image: string
//   categoryId: number
//   subcatId: number
//   productID: string
// }
interface CartItem {
  id: number;
  productID: string;
  name: string;
  // 👇 ADD THIS
  cartTitle: {
    weightNumber: number;
    weightUnit: string;
    productPrice: number;
    disCountProductprice: number;
  };

  weightLabel: string;

  originalPrice: number;
  salePrice: number;

  quantity: number;
  locqunatity: number;

  image: string;
  categoryId: string;
  subcatId: string;
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
    this.subscribeCart();
    // const paymentStatusObj = JSON.parse(localStorage.getItem("paymentStatus") || "{}");
    // if (paymentStatusObj && paymentStatusObj.PaymentData.paymentID) {
    //   this.paymentStatus();
    // }
  }

  // private subscribeCart() {
  //   this.shopService.getCart().subscribe(cart => {
  //     this.serverCartItems = cart;

  //     console.log(this.serverCartItems)

  //     this.cartItems = cart.map((item: any) => ({
  //       id: item.itemID,
  //       name: item.categoryName,
  //       weight: item.cartTitle || '',
  //       originalPrice: Number(item.price),
  //       salePrice: Number(item.price),
  //       quantity: item.locqunatity,
  //       image: item.cartImage,
  //       categoryId: item.categoryID,
  //       subcatId: item.subcatID,
  //       productID: item.productID,
  //       locqunatity: item.locqunatity,


  //     }));
  //   });

  // }
  private subscribeCart() {
    this.shopService.getCart().subscribe(cart => {
      this.serverCartItems = cart;
      console.log(this.serverCartItems)
      // this.cartItems = cart.map((item: any) => {
      //   const w = item.cartTitle;
      //   return {
      //     id: item.itemID,
      //     name: item.categoryName,

      //     // ✅ Weight display
      //     weight: w ? `${w.weightNumber} ${w.weightUnit}` : '',

      //     // ✅ Prices from cartTitle
      //     originalPrice: w?.productPrice || 0,
      //     salePrice:
      //       w?.disCountProductprice && w.disCountProductprice > 0
      //         ? w.disCountProductprice
      //         : w?.productPrice || 0,

      //     quantity: item.locqunatity,
      //     locqunatity: item.locqunatity,

      //     image: item.cartImage,
      //     categoryId: item.categoryID,
      //     subcatId: item.subcatID,
      //     productID: item.productID,
      //   };
      // });

      this.cartItems = cart.map((item: any) => ({
        id: item.itemID,
        productID: item.productID,
        name: item.categoryName,

        cartTitle: item.cartTitle,   // 👈 REQUIRED

        weightLabel: `${item.cartTitle.weightNumber} ${item.cartTitle.weightUnit}`,

        originalPrice: item.cartTitle.productPrice,
        // salePrice:
        //   item.cartTitle.disCountProductprice > 0
        //     ? item.cartTitle.disCountProductprice
        //     : item.cartTitle.productPrice,

        salePrice: item.price,

        quantity: item.locqunatity,
        locqunatity: item.locqunatity,

        image: item.cartImage,
        categoryId: item.categoryID,
        subcatId: item.subcatID,
      }));

    });
    console.log(this.cartItems)
  }

  addAllToCart(items: any[]) {

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

  // incrementQuantity(item: CartItem): void {
  //   this.shopService.updateItem({
  //     productID: item.productID,
  //     cartTitle: item.weight,
  //     locqunatity: item.locqunatity + 1
  //   });
  // }
  incrementQuantity(item: CartItem): void {
    this.shopService.updateItem({
      productID: item.productID,
      cartTitle: item.cartTitle, // FULL OBJECT
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
      this.shopService.removeFromCart(item.productID, item.cartTitle);
    }
  }
  removeItem(item: CartItem): void {
    this.shopService.removeFromCart(item.productID, item.cartTitle);
  }

  // decrementQuantity(item: CartItem): void {
  //   if (item.quantity > 1) {
  //     this.shopService.updateItem({
  //       itemID: item.id,
  //       locqunatity: item.locqunatity - 1
  //     });
  //   } else {
  //     this.shopService.removeFromCart(item.id);
  //   }
  // }
  // removeItem(item: CartItem): void {
  //   this.shopService.removeFromCart(item.id);
  // }




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
    this.closeCartEvent.emit();
    this.router.navigate(["/checkout"])
  }
}

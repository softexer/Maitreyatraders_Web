import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ShopsService } from "src/app/services/shops.service";
import { MaitreyaCustomerService } from "src/app/services/maitreya-customer.service";
import { HttpErrorResponse } from '@angular/common/http';
interface ProductCategory {
  id: string
  name: string
  route: string;
  image?: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string
  name: string
  image?: string;
}

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
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent {
  selectedCategoryId: string | null = null;
  IsProductView: boolean = false;
  activeSection: string = 'products';
  showProductsDropdown = false;
  Subcategories: SubCategory[] = []

  //foter code
  logoPath = '../../../assets/logo.png';
  companyDescription = 'Lorem ipsum dolor sit amet consectetur. Aenean malesuada tincidunt cursetur phasellus.';

  // Quick Links
  quickLinks = [
    { label: 'Home', sectionId: 'home' },
    { label: 'About', sectionId: 'about' },
    { label: 'Products', sectionId: 'products' },
    { label: 'Recipes', sectionId: 'recipes' },
    { label: 'Blog', sectionId: 'blog' }];

  // Contact Information
  contactInfo = {
    khNo: '763, Sirorspur, Badli, Delhi,',
    address: 'India - 110042',
    phone: '+91-0000000000',
    email: 'maitreyatraderslimited@gmail.com'
  };

  // Social Media Links (place social icons in assets folder)
  socialLinks = [
    { name: 'Instagram', icon: '../../../assets/insta.png', url: 'https://instagram.com' },
    { name: 'Facebook', icon: '../../../assets/fb.png', url: 'https://facebook.com' },
    { name: 'YouTube', icon: '../../../assets/youtube.png', url: 'https://youtube.com' }
  ];

  // Copyright text with current year
  copyrightText = `Maitreya Traders Copyright ${new Date().getFullYear()}. All Rights Reserved.`;

  //chcekout
  // Form data
  contactInfo_cart = {
    emailOrMobile: "",
    emailMeOffers: false,
  }

  deliveryInfo = {
    country: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    phoneNumber: "",
  }

  shippingMethod = "Custom Rate"

  billingAddress = {
    sameAsShipping: true,
    useDifferentAddress: false,
    country: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    phoneNumber: "",
  }

  promoCode = ""

  // Cart items
  // cartItems: CartItem[] = [
  //   {
  //     id: 1,
  //     name: "Mock Chicken",
  //     weight: "400 g",
  //     price: 5.99,
  //     quantity: 1,
  //     image: "/mock-chicken.jpg",
  //   },
  //   {
  //     id: 2,
  //     name: "Mock Chicken",
  //     weight: "1 Kg",
  //     price: 12.99,
  //     quantity: 1,
  //     image: "/mock-chicken-1kg.jpg",
  //   },
  // ]

  deliveryFee = 0.0
  cartItems: CartItem[] = [];
  serverCartItems: Array<any> = [];
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private shopService: ShopsService) { }

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
  setActive(section: string): void {
    this.activeSection = section;
    this.showProductsDropdown = false;
  }

  ngOnInit() {
    this.GetAllCategories();
    this.getCartItems();
  }


  // addToCart(product: Product) {
  //   console.log("[v0] Adding to cart:", product.name, product.selectedWeight)
  //   console.log("[v0] Adding to cart:", {
  //     product: this.productName,
  //     weight: this.selectedWeight,
  //     price: this.currentPrice,
  //   })
  //   // Cart logic would go here
  // }


  scrollToAbout() {
    document.getElementById('about')?.scrollIntoView({
      behavior: 'smooth'
    });
  }
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }


  goToProduct(section: string) {
    this.showProductsDropdown = false;
    // this.scrollToSection(section);
  }
  @HostListener('document:click')
  closeDropdown() {
    this.showProductsDropdown = false;
  }


  productImages: string[] = [
    "../../../assets/blur1.png",
    "../../../assets/side1.png",
    "../../../assets/side2.png",
  ]

  selectedImage: string = this.productImages[0]

  // Product Information
  productName = "Mock Chicken"
  originalPrice = "£ 6.00"
  currentPrice = "£ 6.50"

  // Weight Options
  weightOptions: string[] = ["250 g", "450 g", "500 g", "750 g"]
  selectedWeight = "450 g"

  // Product Highlights
  productHighlights: string[] = [
    "Indulge guilt-free in the delectable taste of vegan mock chicken, a plant-based delight.",
    "Elevate your meals with the savory satisfaction of canned vegan mock chicken.",
    "Savor the protein-packed goodness of mock chicken in every convenient can.",
    "From stir-fries to sandwiches, explore versatile creations with canned vegan mock chicken.",
  ]

  // Offer Section
  offerText = "Buy 3 Canned Product Get 1 Free Soya Chaap"
  offerProductImage = "../../../assets/side1.png"

  // Brand Logos - Local paths
  brandLogos = [
    { src: "../../../assets/quality_brd.png", alt: "Quality Certified" },
    { src: "../../../assets/trus_brd.png", alt: "Trusted Seller" },
    { src: "../../../assets/secu_brd.png", alt: "Secure Payment" },
  ]

  // Product Description
  productDescription: string[] = [
    "The emergence of plant-based chicken alternatives has ushered in a delightful culinary revolution, providing a novel experience that closely mimics the taste, texture, and appearance of traditional chicken, all while remaining entirely vegetarian.",
    "Crafted from an assortment of plant-based ingredients, these alternatives offer a cruelty-free and ethical option for individuals who adhere to vegetarian or vegan dietary preferences.",
    "One of the standout benefits of these mock chicken products is their health-conscious profile. Compared to conventional chicken, they tend to contain lower levels of cholesterol and saturated fat, making them a heart-healthy choice.",
    "However, they don't compromise on protein content, and they often provide an abundant source of plant-based protein. This not only supports muscle growth and repair but also contributes to an overall balanced diet.",
    "Furthermore, plant-based chicken alternatives frequently incorporate dietary fiber and other essential nutrients, contributing to a nutritionally robust choice for those looking to maintain a wholesome diet.",
    "Whether you're a dedicated vegetarian, a flexitarian exploring plant-based options, or simply seeking a healthier alternative to traditional chicken, these innovative products offer a tasty, ethical, and nutritious solution that aligns with both your values and your well-being.",
  ]

  // Select image from thumbnails
  selectImage(image: string): void {
    this.selectedImage = image
    console.log("[v0] Selected image:", image)
  }

  // Handle weight change
  onWeightChange(): void {
    console.log("[v0] Selected weight:", this.selectedWeight)
  }

  // Add to cart functionality
  addToCart2(): void {
    console.log("[v0] Adding to cart:", {
      product: this.productName,
      weight: this.selectedWeight,
      price: this.currentPrice,
    })
    // Add your cart logic here
  }

  // Navigate to products page on + button click
  navigateToProducts(): void {
    console.log("[v0] Navigating to products page")
    this.router.navigate(["/products"])
  }

  productCategories: ProductCategory[] = [
    // { id: "1", name: "Frozen Vegan Food", route: "/products" },
    // { id: "2", name: "Frozen Vegetarian Food", route: "/products" },
    // { id: "3", name: "Sauces / Pastes", route: "/products" },

  ]
  // main category
  selectedMainCategoryId: string | null = null;

  // sub category
  selectedSubCategoryId: string | null = null;

  GetAllCategories() {
    this.CustomerService.showLoader.next(true);

    this.CustomerService.LoadAllCategories().subscribe(
      (res: any) => {
        if (res.response === 3) {

          this.productCategories = res.CategoriesData.map((cat: any) => ({
            id: cat.categoryID,
            name: cat.categoryName,
            image: cat.CategoryImage,
            subCategories: (cat.subCategorys || []).map((sub: any) => ({
              id: sub.subCategoryID,
              name: sub.subCategoryName,
              image: sub.SubCategoryProfilePic
            }))
          }));

          // OPTIONAL: auto-select first category
          if (this.productCategories.length) {
            this.selectCategory(this.productCategories[0].id);
          }

          if (this.productCategories.length) {
            this.selectMainCategory(this.productCategories[0].id);
          }

          this.CustomerService.showLoader.next(false);
        } else {
          this.openSnackBar(res.message, '');
          this.CustomerService.showLoader.next(false);
        }
      },
      (err) => {
        this.openSnackBar(err.message, '');
        this.CustomerService.showLoader.next(false);
      }
    );
  }
  selectCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;

    const selected = this.productCategories.find(c => c.id === categoryId);
    this.Subcategories = selected?.subCategories || [];
  }
  selectSubCategory(subCategoryId: string) {
    this.selectedSubCategoryId = subCategoryId;
  }

  selectMainCategory(categoryId: string) {
    this.selectedMainCategoryId = categoryId;
    this.selectedSubCategoryId = null;

    const category = this.productCategories.find(
      c => c.id === categoryId
    );

    // this.Subcategories = category?.subCategories || [];
  }

  //   GetAllCategories() {
  //   this.CustomerService.showLoader.next(true);

  //   this.CustomerService.LoadAllCategories().subscribe(
  //     (posRes: any) => {
  //       console.log(posRes);

  //       if (posRes.response === 3) {

  //            this.productCategories = posRes.CategoriesData.map((cat: any) => ({
  //           id: cat.categoryID,
  //           name: cat.categoryName,
  //           // route: `/products/${cat.categoryID}`   // or '/products'
  //            route: `/products`   
  //         }));

  //         this.CustomerService.showLoader.next(false);

  //       } else {
  //         this.openSnackBar(posRes.message, '');
  //         this.CustomerService.showLoader.next(false);
  //       }
  //     },
  //     (err) => {
  //       this.openSnackBar(err.message, '');
  //       this.CustomerService.showLoader.next(false);
  //       console.warn(err.error);
  //     }
  //   );
  // }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  toggleProductsDropdown(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.showProductsDropdown = !this.showProductsDropdown
    console.log("[v0] Dropdown toggled:", this.showProductsDropdown)
  }

  showDropdown(): void {
    this.showProductsDropdown = true
    console.log("[v0] Dropdown shown")
  }

  hideDropdown(): void {
    this.showProductsDropdown = false
    console.log("[v0] Dropdown hidden")
  }

  navigateToCategory(category: ProductCategory): void {
    console.log("[v0] Navigating to category:", category.name)
    this.activeSection = "products"
    this.showProductsDropdown = false;
    this.router.navigate(["/products"])
    // this.router.navigate([category.route], {
    //   queryParams: { category: category.id, name: category.name },
    // })
  }

  setProduct(section: string): void {
    this.activeSection = section
    this.router.navigate(["/products"])
  }


  // Cart methods
  incrementQuantity(item: CartItem): void {
    item.quantity++
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--
    }
  }

  removeItem(item: CartItem): void {
    this.cartItems = this.cartItems.filter((i) => i.id !== item.id)
  }

  // get subtotal(): number {
  //   return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // }
  get subtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.salePrice * item.quantity, 0)
  }
  get totalToPay(): number {
    return this.subtotal + this.deliveryFee
  }

  applyPromoCode(): void {
    console.log("Applying promo code:", this.promoCode)
    // Add your promo code logic here
  }

  processPayment(): void {
    console.log("Cart Items:", this.cartItems)
    console.log("Processing payment...");

    /* ---------- Contact ---------- */
    const contactData = this.contactInfo_cart.emailOrMobile;

    /* ---------- Delivery Address ---------- */
    const addressDetails = {
      country: this.deliveryInfo.country,
      firstName: this.deliveryInfo.firstName,
      lastName: this.deliveryInfo.lastName,
      address: this.deliveryInfo.address,
      apartment: this.deliveryInfo.apartment,
      city: this.deliveryInfo.city,
      state: this.deliveryInfo.state,
      pincode: this.deliveryInfo.pinCode,
      // phoneNumber: this.deliveryInfo.phoneNumber
    };

    /* ---------- Billing Address ---------- */
    const billingAddressDetails = this.billingAddress.sameAsShipping
      ? { ...addressDetails }
      : {
        country: this.billingAddress.country,
        firstName: this.billingAddress.firstName,
        lastName: this.billingAddress.lastName,
        address: this.billingAddress.address,
        apartment: this.billingAddress.apartment,
        city: this.billingAddress.city,
        state: this.billingAddress.state,
        pincode: this.billingAddress.pinCode,
        // phoneNumber: this.billingAddress.phoneNumber
      };
    /* ---------- Products ---------- */
    const products = this.cartItems.map(item => ({
      productID: item.productID,
      productName: item.name,
      categoryID: "" + item.categoryId,
      subCategoryID: "" + item.subcatId,
      quantity: item.quantity,
      price: item.salePrice,
      weight: item.weight,
      productImagePath: item.image
    }));

    /* ---------- API Payload ---------- */
    const apiPayload = {
      contactData: contactData,
      addressDetails: addressDetails,
      shippingMethod: this.shippingMethod || "Free",
      billingAddressDetails: billingAddressDetails,
      coupanCode: this.promoCode || "",
      // coupanAmount: this.discountAmount || 0,
      coupanAmount: 0 || 0,
      subTotal: this.subtotal,
      deliveryFee: this.deliveryFee,
      totalToPay: this.totalToPay,
      paymentType: "Razorpay",
      Products: products,
      paymentData: {} // filled after Razorpay success
    };

    console.log("API Payload:", apiPayload);

    /* ---------- API Call ---------- */
    this.CustomerService.showLoader.next(true);
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Iis5MTgxMDYwMjI0MjMiLCJpYXQiOjE3NjU3ODk4NzV9.TEOO9eCj_XHNCs8jKG2BlZNZOeZV73U78BUKF0d6eo8"

    this.CustomerService.InsertOrder(apiPayload, token).subscribe(
      (posRes: any) => {
        console.log(posRes)
        this.CustomerService.showLoader.next(false);

        if (posRes.response === 3) {
          // this.openSnackBar("Order placed successfully", "");
          this.openSnackBar(posRes.message, "");
          this.cartItems = [];

          // 2️⃣ Clear localStorage
          localStorage.removeItem('cartItems');

          // Optional: clear payment status if stored
          localStorage.removeItem('paymentStatus');

          // 3️⃣ Reset cart count in service (if used)
          this.shopService.clearCart();

          // Optional: redirect
          // this.router.navigate(['/order-success']);

          this.router.navigateByUrl('/home');
        } else {
          this.openSnackBar(posRes.message, "");
          // this.router.navigateByUrl('/login');
        }
      },
      (err: HttpErrorResponse) => {
        this.CustomerService.showLoader.next(false);
        this.openSnackBar(err.message, "");

        if (err.error instanceof Error) {
          console.warn("Client Side Error", err.error);
        } else {
          console.warn("Server Error", err.error);
        }
      }
    );
  }


  // processPayment(): void {
  //   console.log("Processing payment...")
  //   console.log("Contact Info:", this.contactInfo_cart)
  //   console.log("Delivery Info:", this.deliveryInfo)
  //   console.log("Cart Items:", this.cartItems)
  //   console.log("Total:", this.totalToPay)
  //   // Add your payment processing logic here

  //   let apiPaylod = {
  //     contactData: "8106022423",
  //     addressDetails: {
  //       "country": "India",
  //       "firstName": "Venkat",
  //       "lastName": "Reddy", "address": "ATP", "apartment": "Sai radha residency 404", "city": "Anantapur", "state": "Andra Pradesh", "pincode": "515001"
  //     },
  //     shippingMethod: "Free",
  //     billingAddressDetails: {
  //       "country": "India",
  //       "firstName": "Venkat",
  //       "lastName": "Reddy", "address": "ATP", "apartment": "Sai radha residency 404", "city": "Anantapur", "state": "Andra Pradesh", "pincode": "515001"
  //     },
  //     coupanCode: "",
  //     coupanAmount: 0,
  //     subTotal: 1500,
  //     deliveryFee: 10,
  //     totalToPay: 1510,
  //     paymentType: "Card",
  //     Products: [{ "productID": "PID@1765806952079", "productName": "milk powder cream One", "categoryID": "CIDUJcthg@1765795811719", "subCategoryID": "subCIDVWqZ4NM@1765796186523", "quantity": 3, "price": 500, "weight": "1 Kg", "productImagePath": "/images/productsimages/PID@1765817274592134032461114700790.jpg" }],
  //     paymentData: {}
  //   }
  //   this.CustomerService.showLoader.next(true);
  //   this.CustomerService.InsertOrder(apiPaylod).subscribe((posRes: any) => {
  //     if (posRes.response == 3) {
  //       this.CustomerService.showLoader.next(false);


  //     } else {
  //       this.CustomerService.showLoader.next(false);
  //       this.openSnackBar(posRes.message, "");
  //       this.router.navigateByUrl('/login')
  //     }

  //   },
  //     (err: HttpErrorResponse) => {
  //       this.openSnackBar(err.message, "");
  //       this.CustomerService.showLoader.next(false);
  //       // this.loading = false;
  //       if (err.error instanceof Error) {
  //         console.warn("Client SIde Error", err.error);
  //       } else {
  //         console.warn("Server Error", err.error);
  //       }
  //     })
  // }
}

import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ShopsService } from "src/app/services/shops.service";
import { MaitreyaCustomerService } from "src/app/services/maitreya-customer.service";
import { HttpErrorResponse } from '@angular/common/http';
import { StripePaymentsComponent } from '../stripe-payments/stripe-payments.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfpaymentStatusComponent } from '../confpayment-status/confpayment-status.component';
import { PostalCodeService } from 'src/app/services/postal-code.service';
import { LoginComponent } from '../login/login.component';


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
  isFrozen: boolean;
  isFreeItem?: boolean;
  promoId?: string;
}

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent {
  selectedCategoryId: string | null = null;
  IsProductView: boolean = false;
  activeSection: string = '';
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
    email: 'enquiry@maitreyatraderslimited.co.uk'
  };

  // Social Media Links (place social icons in assets folder)
  socialLinks = [
    { name: 'Instagram', icon: '../../../assets/insta.png', url: 'https://instagram.com' },
    { name: 'Facebook', icon: '../../../assets/fb.png', url: 'https://facebook.com' },
    { name: 'YouTube', icon: '../../../assets/youtube.png', url: 'https://youtube.com' }
  ];

  // Copyright text with current year
  copyrightText = `Maitreya Traders Limited Copyright ${new Date().getFullYear()}. All Rights Reserved.`;

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

  cartItems: CartItem[] = [];
  serverCartItems: Array<any> = [];
  formSubmitted = false;
  cartCount: number = 0;
  @Output() openCart = new EventEmitter<MouseEvent>();
  baseUrl: string = '';
  discountAmt = 0;
  discountOffer: any[] = [];
  // ValidationErrors: { [key: string]: any } = {};
  isLoggeIn: boolean = false;
showMobileMenu = false;
  showMobileProducts = false;
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private shopService: ShopsService,
    private postcodeService: PostalCodeService,
    private elementRef: ElementRef) {
    this.shopService.cartCountItems.subscribe(count => {
      this.cartCount = count;
      this.cdr.markForCheck();
    });
  }


  setActive(section: string): void {
    this.activeSection = section;
    this.showProductsDropdown = false;
  }

  ngOnInit() {
    this.CustomerService.userIdSubject.subscribe((val: any) => {
      console.log(val);
      if (val != 'NotLogin') {
        this.isLoggeIn = true;
      }
    })
     this.CustomerService.latestOrder$.subscribe((orders: any[]) => {
    if (orders && orders.length > 0) {
      this.isLoggeIn = true; // guest order = logged in
    }
  });
    this.baseUrl = this.CustomerService.baseUrl;
    this.GetAllCategories();


    let disoffer = localStorage.getItem('DISCOUNT_PROMO');
    if (disoffer) {
      this.discountOffer = JSON.parse(disoffer);
    }

    console.log(this.discountOffer)
    this.subscribeCart();
  }
  cartpage(event: MouseEvent) {
    event.stopPropagation();
    this.CustomerService.open();
  }

  private subscribeCart() {
    this.shopService.getCart().subscribe(cart => {
      this.serverCartItems = cart;

      this.cartItems = cart.map((item: any) => ({
        id: item.itemID,
        productID: item.productID,
        name: item.categoryName,

        cartTitle: item.cartTitle,

        weightLabel: `${item.cartTitle.weightNumber} ${item.cartTitle.weightUnit}`,

        originalPrice: item.cartTitle.productPrice,
        salePrice: item.price,

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
    this.cdr.markForCheck();
  }

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
  productHighlights: string[] = []

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
  productDescription: string[] = []

  // Select image from thumbnails
  selectImage(image: string): void {
    this.selectedImage = image
    console.log("[v0] Selected image:", image)
  }

  // Handle weight change
  onWeightChange(): void {
    console.log("[v0] Selected weight:", this.selectedWeight)
  }


  // Navigate to products page on + button click
  navigateToProducts(): void {
    console.log("[v0] Navigating to products page")
    this.router.navigate(["/products"])
  }

  productCategories: ProductCategory[] = []
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


  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['center-snackbar'],
      horizontalPosition: 'center'
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
    localStorage.removeItem('CategoryID');
    this.activeSection = "products"
    this.showProductsDropdown = false;
    this.router.navigate(["/products"])
  }
  navigatetocontact() {
    this.router.navigate(["/ContactUs"])
  }
  setProduct(section: string): void {
    this.activeSection = section
    this.router.navigate(["/products"])
  }
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
      this.shopService.removeFromCart(item.productID, item.cartTitle);
    }
  }
  removeItem(item: CartItem): void {
    this.shopService.removeFromCart(item.productID, item.cartTitle);
  }

  MIN_ORDER_AMOUNT = 35;
  FREE_DELIVERY_LIMIT = 80;
  DELIVERY_CHARGE = 5.99;
  FROZEN_SURCHARGE = 2.99;

  // get subtotal(): number {
  //   return this.cartItems.reduce((total, item) => total + item.salePrice * item.quantity, 0)
  // }
  get subtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.salePrice * item.locqunatity,
      0
    );
  }

  get totalToPay(): number {
    return this.subtotal
      + this.deliveryFee
      + this.frozenCharge
      - this.discountAmt;
  }

  get deliveryFee(): number {
    if (this.subtotal >= this.FREE_DELIVERY_LIMIT) {
      return 0; // Free delivery
    }
    return this.DELIVERY_CHARGE;
  }
  get frozenCharge(): number {
    const hasFrozenItem = this.cartItems.some(item => item.isFrozen);
    return hasFrozenItem ? this.FROZEN_SURCHARGE : 0;
  }


  applyPromoCode(): void {
    let promoCode = "";
    this.discountAmt = 0;
    this.cartItems.filter((items: any) => {
      console.log(items);
      if (!items.isFreeItem) {
        this.discountOffer.filter((ditems: any) => {
          console.log(ditems);
          if (ditems.selectFreeProductID == items.categoryId && ditems.applicableIds.includes(items.subcatId)) {
            this.promoCode = ditems.enterCoupanCode;
            this.discountAmt += ((items.salePrice) * (Number(items.locqunatity) * Number(ditems.discountAmountPercentage))) / 100
           console.log(this.promoCode)
          }
        })
      }
    })
  }
  markAllTouched(form: any) {
    Object.values(form.controls).forEach((control: any) => {
      control.markAsTouched();
      control.markAsDirty();

      // for nested forms
      if (control.controls) {
        Object.values(control.controls).forEach((c: any) => {
          c.markAsTouched();
          c.markAsDirty();
        });
      }
    });
  }
  scrollToFirstError() {
    const el = document.querySelector('.invalid');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onBillingToggle() {
    if (this.billingAddress.sameAsShipping) {
      this.billingAddress = {
        sameAsShipping: true,
        useDifferentAddress: false,
        country: this.deliveryInfo.country,
        firstName: this.deliveryInfo.firstName,
        lastName: this.deliveryInfo.lastName,
        address: this.deliveryInfo.address,
        apartment: this.deliveryInfo.apartment,
        city: this.deliveryInfo.city,
        state: this.deliveryInfo.state,
        pinCode: this.deliveryInfo.pinCode,
        phoneNumber: this.deliveryInfo.phoneNumber,
      };
    }
  }
  processPayment(form: any): void {
    console.log(this.subtotal)

    // if (this.subtotal < this.MIN_ORDER_AMOUNT) {
    //   this.openSnackBar(
    //     `Minimum order amount is £${this.MIN_ORDER_AMOUNT}`, '');
    //   return;
    // }

    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    if (this.cartItems.length === 0) {
      this.openSnackBar('Your cart is empty', '');
      return;
    }

    let dailogRef = this.dialog.open(StripePaymentsComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: {
        totalAmt: this.totalToPay,
        inrAmt: 1,
        name: this.deliveryInfo.firstName,
        email: this.contactInfo_cart.emailOrMobile,
        address: this.deliveryInfo,
        phno: this.deliveryInfo.phoneNumber
      }
    });
    dailogRef.afterClosed().subscribe((res) => {
      console.log(res)
      if (res) {
        if (res.pstatus) {
          this.processPayment1(form, res.paymentData);
        }
      }

    });
  }
  stripePaymentComplete(paymentStatusObj: any) {
    this.CustomerService.RegisterConference(paymentStatusObj).subscribe((posRes: any) => {
      if (posRes.response == 3) {
        this.openSnackBar(posRes.message, "");
        localStorage.removeItem("conferencePayStatus");
        this.CustomerService.showLoader.next(false);
        let obj = {
          isSuccess: true,
        };
        let dialog = this.dialog.open(ConfpaymentStatusComponent, {
          panelClass: "col-md-4",
          hasBackdrop: true,
          disableClose: true,
          data: obj,
        });
        dialog.afterClosed().subscribe((res: any) => {
        })
      } else {
        this.openSnackBar(posRes.message, "");
        this.CustomerService.showLoader.next(false);
      }
    }, (err: HttpErrorResponse) => {
      this.openSnackBar(err.message, "");
      this.CustomerService.showLoader.next(false);
      if (err.error instanceof Error) {
        console.warn("Client SIde Error", err.error);
      } else {
        console.warn("Server Error", err.error);
      }
    })
  }
  processPayment1(form: any, paymentData: any): void {
    if (form.invalid) {
      form.form.markAllAsTouched();   // 🔥 KEY FIX
      return;
    }

    if (this.cartItems.length === 0) {
      this.openSnackBar('Your cart is empty', '');
      return;
    }
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
      phoneNumber: this.deliveryInfo.phoneNumber
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
        phoneNumber: this.billingAddress.phoneNumber
      };
    /* ---------- Products ---------- */

    const products = this.cartItems.map(item => ({
      productID: item.productID,
      productName: item.name,

      categoryID: String(item.categoryId),
      subCategoryID: String(item.subcatId),

      quantity: item.quantity,

      // ✅ PRICE LOCKED TO WEIGHT
      // price: Math.round(item.cartTitle.productPrice * 100),
      price: item.cartTitle.productPrice,
      // discountPrice: item.cartTitle.disCountProductprice,
      weight: item.cartTitle.weightNumber + " " + item.cartTitle.weightUnit,


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
      subTotal: Number(this.subtotal.toFixed(2)),
      deliveryFee: Number(this.deliveryFee.toFixed(2)),
      totalToPay: Number(this.totalToPay.toFixed(2)),
      fronzenCharges: Number(this.frozenCharge.toFixed(2)),
      paymentType: "Stripe",
      Products: products,
      paymentData: paymentData // filled after Razorpay success
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
          this.openSnackBar(posRes.message, "");
          this.cartItems = [];
          localStorage.removeItem('cartItems');
          localStorage.removeItem('paymentStatus');
          this.shopService.clearCart();
          this.CustomerService.setUserId(this.contactInfo_cart.emailOrMobile);
          // this.router.navigateByUrl('/home');

          // 🔥 SAVE ORDER
          this.CustomerService.setLatestOrder(posRes.orderData);

          // 🔥 SAVE USER (guest login)
          this.CustomerService.setUserId(this.contactInfo_cart.emailOrMobile);
          this.router.navigate(['/OrderSummary']);



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

  limitPhoneLength() {
    if (this.billingAddress.phoneNumber) {
      this.billingAddress.phoneNumber =
        this.billingAddress.phoneNumber.replace(/\D/g, '').slice(0, 11);
    }
  }
  scrollToContact() {
    this.activeSection = 'contact';

    const footer = document.getElementById('contact');
    if (!footer) return;

    const headerOffset = 80; // height of fixed header
    const elementPosition = footer.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  navigatetoabout() {
    this.router.navigate(["/about-us"])
  }

  //search

  showSearch: boolean = false;
  searchText: string = ''

  toggleSearch() {
    this.showSearch = true;
  }
  AllSearchItems: Array<any> = [];
  displaylist: boolean = false;
  GotoSearch() {
    if (!this.searchText || !this.searchText.trim()) {
      // this.displaylist = false;
      return;
    }
    const payload = {
      searchText: this.searchText
    };
    this.displaylist = true;
    this.CustomerService.showLoader.next(true);
    this.CustomerService.SearchinHdr(payload).subscribe(
      (res: any) => {
        console.log(res)
        if (res.response === 3) {
          this.AllSearchItems = res.SearchProducts || [];
        } else {
          this.AllSearchItems = [];
          console.error("Unexpected response:", res.message);
        }
        this.CustomerService.showLoader.next(false);
      },
      (err: HttpErrorResponse) => {
        console.error("Error fetching:", err);
        this.openSnackBar(err.message, "");
        this.CustomerService.showLoader.next(false);
      }
    );
  }

  ProductView(pd: any) {
    console.log(pd);
    localStorage.setItem("CategoryID", pd.categoryID.toString());
    localStorage.setItem("SerhSubCat", pd.subCategoryID.toString());
    localStorage.setItem("SearchProHm", pd.productID.toString());
    this.activeSection = "products"
    this.showProductsDropdown = false;
    this.router.navigate(["/products"])

  }
  gotoAllProducts() {
    this.router.navigate(["/products"])
  }

  closeSearch() {
    this.showSearch = false;
    this.searchText = "";
    this.displaylist = false;
  }
  numericOnly(event: KeyboardEvent) {
    const pattern = /^[0-9]*$/;
    if (!pattern.test(event.key)) {
      event.preventDefault(); // Prevent input if it's not a number
    }
  }

  postcodes: string[] = [];
  showpostalDropdown = false;

  postcodes2: string[] = [];
  showpostalDropdown2 = false;

  onPostcodeInput(value: string) {
    console.log('Typed value:', value);

    if (!value || value.length < 2) {
      this.postcodes = [];
      this.showpostalDropdown = false;
      return;
    }

    this.postcodeService.searchPostcodes(value).subscribe({
      next: (res: any) => {
        console.log('API response:', res);

        this.postcodes = (res?.result || []).map((pc: any) =>
          typeof pc === 'string' ? pc : pc.postcode
        );

        this.showpostalDropdown = this.postcodes.length > 0;
      },
      error: err => {
        console.error('Postcode API error:', err);
      }
    });
  }

  selectPostcode(postcode: string) {
    this.showpostalDropdown = false;

    if (!postcode) return;

    this.deliveryInfo.pinCode = postcode;

    this.postcodeService.getPostcodeDetails(postcode).subscribe({
      next: (res: any) => {
        const data = res?.result;
        if (!data) return;

        this.deliveryInfo.city =
          data.admin_district || data.post_town || '';

        this.deliveryInfo.state =
          data.region || data.pfa || '';

        this.deliveryInfo.country =
          ['England', 'Scotland', 'Wales', 'Northern Ireland'].includes(data.country)
            ? 'UK'
            : data.country || '';

        this.deliveryInfo.address =
          `${data.admin_ward || ''}, ${data.admin_district || ''}`.replace(/^,|,$/g, '');
      },
      error: err => console.error(err)
    });
  }


  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showpostalDropdown = false;
    }
  }

    onPostcodeInput2(value: string) {
    console.log('Typed value:', value);

    if (!value || value.length < 2) {
      this.postcodes2 = [];
      this.showpostalDropdown2 = false;
      return;
    }

    this.postcodeService.searchPostcodes(value).subscribe({
      next: (res: any) => {
        console.log('API response:', res);

        this.postcodes2 = (res?.result || []).map((pc: any) =>
          typeof pc === 'string' ? pc : pc.postcode
        );

        this.showpostalDropdown2 = this.postcodes2.length > 0;
      },
      error: err => {
        console.error('Postcode API error:', err);
      }
    });
  }

  selectPostcode2(postcode: string) {
    this.showpostalDropdown2 = false;

    if (!postcode) return;

    this.billingAddress.pinCode = postcode;

    this.postcodeService.getPostcodeDetails(postcode).subscribe({
      next: (res: any) => {
        const data = res?.result;
        if (!data) return;

        this.billingAddress.city =
          data.admin_district || data.post_town || '';

        this.billingAddress.state =
          data.region || data.pfa || '';

        this.billingAddress.country =
          ['England', 'Scotland', 'Wales', 'Northern Ireland'].includes(data.country)
            ? 'UK'
            : data.country || '';

        this.billingAddress.address =
          `${data.admin_ward || ''}, ${data.admin_district || ''}`.replace(/^,|,$/g, '');
      },
      error: err => console.error(err)
    });
  }
  Logout() {
    this.cartItems = [];
    localStorage.removeItem('cartItems');
    localStorage.removeItem('paymentStatus');
    this.shopService.clearCart();
    // localStorage.removeItem('Userid');
    let userid = "NotLogin";               // 🔥 IMPORTANT
    this.CustomerService.setUserId(userid);
    this.shopService.cartCountItems.next(0);
    localStorage.clear();
    // this.openSnackBar('You’ve been logged out successfully.', '');
    this.router.navigateByUrl('/home');
  }
  navigateorders() {
    this.router.navigate(["/OrderSummary"])
  }
  LoginPage(form: any) {
    const enteredUserId = this.contactInfo_cart.emailOrMobile;
    const storedUserId = localStorage.getItem('Userid');
    console.log(enteredUserId, storedUserId)

    // ✅ SAME USER → skip API
    if (storedUserId && storedUserId === enteredUserId) {
      console.log('Same user detected, skipping login API');
      this.processPayment(form);
      return;
    }

    let dailogRef = this.dialog.open(LoginComponent, {
      panelClass: 'col-md-3',
      hasBackdrop: true,
      disableClose: true,
      data: {
        ems: this.contactInfo_cart.emailOrMobile
      }
    });
    dailogRef.afterClosed().subscribe((res) => {
      console.log(res)
      if (res) {
        this.processPayment(form);


      }
    });
  }

  
  toggleMobileMenu() {
    console.log(this.showMobileMenu)
    this.showMobileMenu = !this.showMobileMenu;
    if (!this.showMobileMenu) {
      this.showMobileProducts = false;
    }
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
    this.showMobileProducts = false;
  }

  toggleMobileProducts() {
    this.showMobileProducts = !this.showMobileProducts;
  }
}

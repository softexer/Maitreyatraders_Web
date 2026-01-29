import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaitreyaCustomerService } from 'src/app/services/maitreya-customer.service';

import { HttpErrorResponse } from '@angular/common/http';
import { ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopsService } from 'src/app/services/shops.service';
import emailjs from '@emailjs/browser';
import { AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoginComponent } from '../login/login.component';

interface CarouselSlide {
  title: string
  titleHighlight: string
  description: string
  customerAvatars: string[]
  rating: number
  reviewCount: string
  productImage: string
  productIcon: string
  productName: string
  productRating: number
  price: string
}

interface ProductWeight {
  productPrice: number;
  disCountProductprice: number;
  weightNumber: number;
  weightUnit: string;
  weightKey?: string;
}

interface Product {
  id: number;
  productID: string;
  name: string;
  subtitle?: string;
  image: string;
  productImagesList?: string[];

  weights: ProductWeight[];
  selectedWeight: ProductWeight;

  originalPrice: number;
  price: number;

  discount?: number;
  type: string;
  categoryId: string;
  subcatId: string;

  description?: string[]
  highlights?: string[]
}


interface Testimonial {
  text: string
  name: string
  role: string
  avatar: string
  rating: number
}
interface ProductCategory {
  id: string
  name: string
  route: string
}


interface OrderResponse {
  response: number;
  OrderData: any[];
}

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent {

  orders: any[] = [];
  loading = true;
  baseUrl: string = "";
  userid: string = "";

  activeSection: string = 'order';
  currentSlide = 0
  autoPlayInterval: any
  @ViewChild("bestSellersScroll") bestSellersScroll!: ElementRef
  currentTestimonial = 0
  Math = Math
  activePolicy: string = 'terms'

  showProductsDropdown = false;
  @ViewChildren('animate') elements!: QueryList<ElementRef>;
  slides: CarouselSlide[] = [
    {
      title: "100% Vegetarian/Vegan",
      titleHighlight: "frozen food",
      description: "Lorem ipsum dolor sit amet consectetur. Aenean mau risnam tortor curabitur phasellus.",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.8,
      reviewCount: "18.5k Review",
      productImage: "../../../assets/image_1.png",
      productIcon: "../../../assets/Rectangle1.png",
      productName: "Chicken",
      productRating: 4,
      price: "5.80",
    },
    {
      title: "Delicious Organic",
      titleHighlight: "vegan meals",
      description: "Experience the best taste with our handcrafted organic vegan products.",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.9,
      reviewCount: "22.3k Review",
      productImage: "../../../assets/Rectangle2.png",
      productIcon: "../../../assets/Rectangle2.png",
      productName: "Vegan Mix",
      productRating: 5,
      price: "7.50",
    },
    {
      title: "Premium Quality",
      titleHighlight: "plant-based",
      description: "Sourced from the finest ingredients for your healthy lifestyle.",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.7,
      reviewCount: "15.8k Review",
      productImage: "../../../assets/Rectangle3.png",
      productIcon: "../../../assets/Rectangle3.png",
      productName: "Plant Bowl",
      productRating: 4,
      price: "6.20",
    },
  ]

showMobileMenu = false;
showMobileProducts = false;
  newLaunchedProducts: Product[] = [];
  bestSellers: Product[] = []
  isCartOpen: boolean = false;
  cartCount: number = 0;
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private shopService: ShopsService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.shopService.cartCountItems.subscribe(count => {
      this.cartCount = count;
    });
    // this.CustomerService.userId$
    //   .subscribe(uid => {
    //     console.log('UserID from observable:', uid);

    //     // ✅ IF condition
    //     if (uid && uid.trim() !== '') {
    //       if (uid !== this.userid) {
    //         this.userid = uid;

    //       }
    //     }
    //     // ✅ ELSE condition (logout / not logged in)
    //     else {
    //       this.userid = '';
    //       this.orders = [];
    //       console.log('No user → open login if needed');
    //     }
    //     this.loadOrders();
    //   });


    // console.log(this.userid)

  }

  ngOnInit() {
    this.baseUrl = this.CustomerService.baseUrl;
    this.startAutoPlay();
    this.GetHomepageData();
    this.GetAllCategories();
    this.newLaunchedProducts.forEach(p => {
      if (!p.selectedWeight) {
        p.selectedWeight = p.weights?.[0];
      }
    });

    this.subscribeCart();
    this.route.params.subscribe(params => {
      this.activePolicy = params['type'];
      window.scrollTo(0, 0);
    });

    this.CustomerService.latestOrder$.subscribe((orders: any[]) => {
      this.orders = orders;
      console.log(this.orders)
    });

  }

  setActive(section: string): void {
    console.log(section)
    this.activeSection = section;
  }
   navigatetocontact() {
    this.router.navigate(["/ContactUs"])
  }
 
  loadOrders2() {
    if (this.userid != '') {
      let payload = {
        userID: this.userid,
        orderID: "All"
      }
      console.log(payload)
      this.CustomerService.OrdersFetch(payload).subscribe(
        (res: any) => {
          console.log(res)
          if (res.response === 3) {
            this.orders = res.OrderData.sort(
              (a: any, b: any) => b.orderTimeStamp - a.orderTimeStamp
            );
            console.log(this.orders)
            this.loading = false;

          } else {
            this.orders = [];
            this.loading = false;
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
    if (!this.userid || this.userid.trim() === '') {
      this.loading = false; // ✅ stop loader

      let dailogRef = this.dialog.open(LoginComponent, {
        panelClass: 'col-md-3',
        hasBackdrop: true,
        disableClose: true,
        data: {
        }
      });
      dailogRef.afterClosed().subscribe((res) => {
        console.log(res)
        if (res) {
          this.router.navigate(["/home"])

        }
      });
    }

  }

  loadOrders() {
    // 🔥 IMPORTANT FIX
    if (!this.userid || this.userid.trim() === '') {
      this.loading = false; // ✅ stop loader

      const dialogRef = this.dialog.open(LoginComponent, {
        panelClass: 'col-md-3',
        hasBackdrop: true,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          // this.router.navigate(['/home']);
          //  this.router.navigate(['/OrderSummary']);
          return; // ⛔ stop execution
        }
      });


    } else {



      // ✅ Logged-in user flow
      this.loading = true;

      const payload = {
        userID: this.userid,
        orderID: 'All'
      };

      this.CustomerService.OrdersFetch(payload).subscribe(
        (res: any) => {
          if (res.response === 3 && res.OrderData?.length) {
            this.orders = res.OrderData.sort(
              (a: any, b: any) => b.orderTimeStamp - a.orderTimeStamp
            );
          } else {
            this.orders = [];
          }
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.openSnackBar(err.message, '');
        }
      );
    }
  }

  getOrderDate(ts: string) {
    return new Date(Number(ts));
  }

  ngOnDestroy() {
    this.stopAutoPlay()
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide()
    }, 5000)
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval)
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1
  }

  goToSlide(index: number) {
    this.currentSlide = index
    this.stopAutoPlay()
    this.startAutoPlay()
  }

  addToCart(product: Product) {
    const w = product.selectedWeight;
    if (!w) return;

    this.shopService.addToCart({
      ...product,
      weightKey: w.weightKey,
      weightNumber: w.weightNumber,
      weightUnit: w.weightUnit,
      price: product.price
    });
  }

  scrollBestSellersLeft() {
    if (this.bestSellersScroll) {
      this.bestSellersScroll.nativeElement.scrollBy({
        left: -350,
        behavior: "smooth",
      })
    }
  }
  navigatetoabout() {
    this.router.navigate(["/about-us"])
  }

  scrollBestSellersRight() {
    if (this.bestSellersScroll) {
      this.bestSellersScroll.nativeElement.scrollBy({
        left: 350,
        behavior: "smooth",
      })
    }
  }


  reviewerAvatars: string[] = ["../../../assets/testi_1.png", "../../../assets/testi_2.png", "../../../assets/testi_3.png"]

  testimonials: Testimonial[] = [
    {
      text: "Lorem ipsum dolor sit amet consectetur. Aenean maurisnam tortor curabitur phasellus. Lorem ipsum dolor sit amet consectetur. Aenean maurisnam tortor curabitur phasellus.",
      name: "Theresa Jordan",
      role: "Food Enthusiast",
      avatar: "../../../assets/testi_1.png",
      rating: 4.8,
    },
    {
      text: "Absolutely amazing quality! The plant-based products taste authentic and delicious. I'm impressed with the variety and freshness of every item I've tried.",
      name: "Michael Chen",
      role: "Professional Chef",
      avatar: "../../../assets/testi_2.png",
      rating: 5.0,
    },
    {
      text: "As a vegan, finding quality frozen foods has always been a challenge. Maitreya Traders has changed that completely. Highly recommended!",
      name: "Sarah Williams",
      role: "Nutritionist",
      avatar: "../../../assets/testi_3.png",
      rating: 4.9,
    },
  ]
  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length
  }

  prevTestimonial() {
    this.currentTestimonial = this.currentTestimonial === 0 ? this.testimonials.length - 1 : this.currentTestimonial - 1
  }

  scrollToAbout() {
    document.getElementById('about')?.scrollIntoView({
      behavior: 'smooth'
    });
  }

  scrollToSection(sectionId: string): void {
    console.log(sectionId)
    const element = document.getElementById(sectionId);

    if (!element) return;

    const yOffset = -300; // 👈 adjust this value
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  }



  goToProduct(section: string) {
    // this.showProductsDropdown = false;
    // this.scrollToSection(section);
  }
  @HostListener('document:click')
  closeDropdown() {
    this.showProductsDropdown = false;
  }

  //foter code
  logoPath = '../../../assets/logo.png';

  // Company description
  companyDescription = 'At Maitreya Traders, we believe in combining health, taste, and tradition. Our mission is to make plant-based eating exciting and accessible by offering premium-quality vegan and vegetarian products sourced from around the world. ';

  // Quick Links
  quickLinks = [
    { label: 'Home', sectionId: 'home', route: "/home" },
    { label: 'About', sectionId: 'about', route: '/about-us' },
    { label: 'Products', sectionId: 'products', route: '/products' },
      { label: 'Contact Us', sectionId: 'contact', route: '/ContactUs' },

  ];

  // Contact Information
  contactInfo = {
    khNo: '71-75 Shelton Street, Covent Garden, London,',
    address: 'United Kingdom, WC2H 9JQ',
    phone: '+44 7982376506',
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
  // isCartOpen: boolean = false;
  @Output() openCart = new EventEmitter<MouseEvent>();
  cartpage(event: MouseEvent) {
    event.stopPropagation();
    if (this.cartCount > 0) {
      this.CustomerService.open();
    }

  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }

  productCategories: ProductCategory[] = []


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
    console.log("[v0] Navigating to category:", category)
    localStorage.setItem("CategoryID", category.id.toString());
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
  GetHomepageData() {
    this.CustomerService.showLoader.next(true);

    this.CustomerService.HomepageData().subscribe(
      (posRes: any) => {
        console.log(posRes);

        if (posRes.response === 3) {
          /* 🔥 NEW LAUNCHED PRODUCTS */
          this.newLaunchedProducts = posRes.NewProducts.map(
            (item: any, index: number): Product => {

              const weights: ProductWeight[] = (item.weightList || []).map((w: any) => ({
                ...w,
                weightKey: `${w.weightNumber}_${w.weightUnit}`   // 🔥 unique key
              }));

              const selectedWeight = weights[0];

              return {
                id: index + 1,
                productID: item.productID,
                name: item.productName,
                subtitle: item.subCategoryName ? `(${item.subCategoryName})` : '',
                image: item.productImagesList?.length
                  ? this.baseUrl + item.productImagesList[0]
                  : 'assets/no-image.png',

                productImagesList: item.productImagesList?.map(
                  (img: string) => this.baseUrl + img
                ),

                weights,
                selectedWeight,

                originalPrice: selectedWeight?.productPrice || 0,
                price:
                  selectedWeight?.productPrice -
                  (selectedWeight?.disCountProductprice || 0),

                discount: selectedWeight?.disCountProductprice
                  ? Math.round(
                    (selectedWeight.disCountProductprice /
                      selectedWeight.productPrice) * 100
                  )
                  : 0,

                type: item.categoryName ? `(${item.categoryName})` : '',
                categoryId: item.categoryID,
                subcatId: item.subCategoryID,

                highlights: item.productHighlight,
                description: item.productDescription
              };
            }
          );

          console.log(this.newLaunchedProducts)

          /* 🔥 BEST SELLERS */
          this.bestSellers = posRes.BestSalesProductsData.map(
            (item: any, index: number): Product => {

              const weights: ProductWeight[] = (item.weightList || []).map((w: any) => ({
                ...w,
                weightKey: `${w.weightNumber}_${w.weightUnit}`   // 🔥 unique key
              }));

              const selectedWeight = weights[0];

              return {
                id: index + 1,
                productID: item.productID,
                name: item.productName,
                subtitle: item.subCategoryName ? `(${item.subCategoryName})` : '',
                image: item.productImagesList?.length
                  ? this.baseUrl + item.productImagesList[0]
                  : 'assets/no-image.png',

                productImagesList: item.productImagesList?.map(
                  (img: string) => this.baseUrl + img
                ),

                weights,
                selectedWeight,

                originalPrice: selectedWeight?.productPrice || 0,
                price:
                  selectedWeight?.productPrice -
                  (selectedWeight?.disCountProductprice || 0),

                discount: selectedWeight?.disCountProductprice
                  ? Math.round(
                    (selectedWeight.disCountProductprice /
                      selectedWeight.productPrice) * 100
                  )
                  : 0,

                type: item.categoryName ? `(${item.categoryName})` : '',
                categoryId: item.categoryID,
                subcatId: item.subCategoryID,
                highlights: item.productHighlight,
                description: item.productDescription
              };
            }
          );


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


  onWeightChange(product: Product) {
    const w = product.selectedWeight;

    if (!w) return;

    // Original price always = productPrice
    product.originalPrice = w.productPrice || 0;

    // Final price = productPrice - disCountProductprice
    product.price =
      w.productPrice - (w.disCountProductprice || 0);

    // Optional: update discount field for badge
    product.discount = w.disCountProductprice
      ? Math.round((w.disCountProductprice / w.productPrice) * 100)
      : 0;
  }



  GetAllCategories() {
    this.CustomerService.showLoader.next(true);

    this.CustomerService.LoadAllCategories().subscribe(
      (posRes: any) => {
        console.log(posRes);

        if (posRes.response === 3) {

          this.productCategories = posRes.CategoriesData.map((cat: any) => ({
            id: cat.categoryID,
            name: cat.categoryName,
            // route: `/products/${cat.categoryID}`   // or '/products'
            route: `/products`
          }));
          console.log(this.productCategories)
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
  private getDiscount(value: any): number {
    if (!value || typeof value !== 'string') {
      return 0;
    }

    const numericValue = value.replace(/[^0-9]/g, '');

    return numericValue ? Number(numericValue) : 0;
  }
  cartItems: any[] = [];



  // getCartItem(product: Product) {
  //   return this.cartItems.find(item =>
  //     item.productID === product.productID &&
  //     item.weight === product.selectedWeight
  //   );
  // }

  getCartItem(product: Product) {
    if (!product.selectedWeight) return null;

    return this.cartItems.find(item =>
      item.productID === product.productID &&
      item.cartTitle?.weightNumber === product.selectedWeight.weightNumber &&
      item.cartTitle?.weightUnit === product.selectedWeight.weightUnit
    );
  }
  isInCart(product: Product): boolean {
    return !!this.getCartItem(product);
  }


  // isInCart(product: any): boolean {
  //   // console.log('PRODUCT', product.productID, product.selectedWeight);
  //   // console.log('CART', this.cartItems);

  //   return this.cartItems.some(item =>
  //     item.productID === product.productID &&
  //     item.weight === product.selectedWeight
  //   );
  // }


  incrementQuantity(item: any) {
    this.shopService.updateItem({
      productID: item.productID,
      cartTitle: item.cartTitle,   // ✅ CORRECT
      locqunatity: item.locqunatity + 1
    });
  }
  decrementQuantity(item: any) {
    if (item.locqunatity > 1) {
      this.shopService.updateItem({
        productID: item.productID,
        cartTitle: item.cartTitle,  // ✅ CORRECT
        locqunatity: item.locqunatity - 1
      });
    } else {
      this.shopService.removeFromCart(
        item.productID,
        item.cartTitle              // ✅ CORRECT
      );
    }
  }

  // incrementQuantity(item: any) {
  //   this.shopService.updateItem({
  //     productID: item.productID,
  //     cartTitle: item.weight,          // ✅ REQUIRED
  //     locqunatity: item.locqunatity + 1
  //   });
  // }

  // decrementQuantity(item: any) {
  //   if (item.locqunatity > 1) {
  //     this.shopService.updateItem({
  //       productID: item.productID,
  //       cartTitle: item.weight,        // ✅ REQUIRED
  //       locqunatity: item.locqunatity - 1
  //     });
  //   } else {
  //     this.shopService.removeFromCart(item.productID, item.weight);
  //   }
  // }


  private subscribeCart() {
    // this.shopService.getCart().subscribe(cart => {
    //   // this.serverCartItems = cart;

    //   this.cartItems = cart.map((item: any) => ({
    //     id: item.itemID,
    //     name: item.categoryName,
    //     weight: item.cartTitle || '',
    //     originalPrice: Number(item.price),
    //     salePrice: Number(item.price),
    //     quantity: item.locqunatity,
    //     image: item.cartImage,
    //     categoryId: item.categoryID,
    //     subcatId: item.subcatID,
    //     productID: item.productID,
    //     locqunatity: item.locqunatity,
    //   }));
    // });


    this.shopService.getCart().subscribe(cart => {
      // this.serverCartItems = cart;
      // console.log(this.serverCartItems)
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
        isFrozen: item.isFrozen || false
      }));

    });
  }
  newsletterEmail: string = '';

  sendEmail2() {
    if (!this.newsletterEmail) {
      this.openSnackBar('Please enter email', '');
      return;
    }

    // this.openSnackBar('Send to email in progress', '');

    // 👉 call API / EmailJS here

    // ✅ clear input after snackbar
    this.newsletterEmail = '';
  }
  isSubmitting = false;
  isSubmitted = false;
  submittedText: string = "";
 

  async sendEmail() {
    if (this.isSubmitting) return;

    // Empty check
    if (!this.newsletterEmail || this.newsletterEmail.trim() === '') {
      this.openSnackBar('Email is required!', '');
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.newsletterEmail.trim())) {
      this.openSnackBar('Please enter a valid email address..!', '');
      return;
    }

    this.isSubmitting = true;

    const apipayload = {
      title: 'Subscription Emails',
      name: 'Subscription: Request',
      email: this.newsletterEmail.trim(),
    };

    try {
      const response = await emailjs.send(
        'service_4i31vcn',
        'template_vm2sdr9',
        apipayload,
        { publicKey: '0TocvA3hn_6xpQ9SV' }
      );

      if (response.status === 200) {
        this.openSnackBar('Thanks for signing up! We’re excited to have you.', '');
        this.newsletterEmail = '';
      }
    } catch (error) {
      console.error(error);
      this.openSnackBar('Your Details Not Submitted!', '');
    } finally {
      this.isSubmitting = false;
    }
  }
  resetForm() {
    this.newsletterEmail = ''
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

  tabTypeData: Array<any> = [];
  subDisplayPage: boolean = false;

  ViewToProductDetails(product: Product) {
    console.log(product)
    this.subDisplayPage = true;
    this.tabTypeData = [{
      operation: 'ViewFrmHome', sendobj: product
    }];

  }

  Close_scientic_suply(event: any) {
    this.subDisplayPage = false;
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



  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    this.elements.forEach(el => observer.observe(el.nativeElement));
  }

  navigateorders() {
    this.router.navigate(["/OrderSummary"])
  }

toggleMobileMenu() {
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
    // this.router.navigateByUrl('/home');
  }
}

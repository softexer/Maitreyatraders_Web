import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { customValidator } from '../../validators/custom-email.validator';
import { HttpErrorResponse } from '@angular/common/http';
import emailjs from '@emailjs/browser';

import { ElementRef, EventEmitter, HostListener, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaitreyaCustomerService } from 'src/app/services/maitreya-customer.service';
import { ShopsService } from 'src/app/services/shops.service';


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


@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit, OnDestroy, AfterViewInit {
  currentSlide = 0
  autoPlayInterval: any
  @ViewChild("bestSellersScroll") bestSellersScroll!: ElementRef
  currentTestimonial = 0
  Math = Math
  baseUrl: string = '';
  activePolicy: string = 'terms'

  showProductsDropdown = false;
  @ViewChildren('animate') elements!: QueryList<ElementRef>;

  isLoggeIn: boolean = false;

  newLaunchedProducts: Product[] = [];
  bestSellers: Product[] = []
  isCartOpen: boolean = false;
  cartCount: number = 0;

  contactForm!: FormGroup;
  submitted = false;
  submittedText: string = "";
  isLoading: boolean = false;

  activeSection: string = 'contact';

  loading = false;

  form = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  };
  showMobileMenu = false;
  showMobileProducts = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private shopService: ShopsService,
    private route: ActivatedRoute
  ) {
    this.shopService.cartCountItems.subscribe(count => {
      this.cartCount = count;
    });
  }


  ngOnInit(): void {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, customValidator('email')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), customValidator('mobile')]],
      message: ['', Validators.required]
    });
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
    // this.startAutoPlay();
    // this.GetHomepageData();
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
  }
  get f(): { [key: string]: any } {
    return this.contactForm.controls;
  }
  numericOnly(event: KeyboardEvent) {
    const pattern = /^[0-9]*$/;
    if (!pattern.test(event.key)) {
      event.preventDefault(); // Prevent input if it's not a number
    }
  }

  // async sendEmail() {

  //   if (!this.form.name || !this.form.email || !this.form.message) {
  //     alert('Please fill required fields');
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   this.loading = true;
  //   const apipayload = {
  //     title: 'Contact us emails',
  //     name: 'Contact Us: Enquiry request',
  //     from_name: this.form.name,
  //     from_email: this.form.email,
  //     phone: this.form.phone,
  //     subject: this.form.subject,
  //     message: this.form.message,
  //   };
  //   console.log(apipayload)


  //   let response = await emailjs.send("service_4i31vcn", "template_aizbuok", apipayload, { publicKey: '0TocvA3hn_6xpQ9SV' });
  //   console.log(response)
  //   if (response.status == 200) {
  //     this.openSnackBar('Thank you...Your details have been submitted successfully', '');

  //     setTimeout(() => {
  //       this.isSubmitting = false;
  //       this.isSubmitted = true;
  //       this.resetForm();
  //       this.loading = false;

  //       setTimeout(() => {
  //         this.isSubmitted = false;
  //         this.loading = false;
  //       }, 5000);
  //     }, 2000);


  //   } else {
  //     this.openSnackBar('Your Details Not Submitted!', '');
  //   }

  // }


  async sendEmail(contactForm: any) {

    // if invalid -> show errors but STOP sending
    if (contactForm.invalid) {
      contactForm.form.markAllAsTouched();
      this.openSnackBar('Please fill all required fields correctly!', '');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.loading = true;

    const apipayload = {
      title: 'Contact us emails',
      name: 'Contact Us: Enquiry request',
      from_name: this.form.name,
      from_email: this.form.email,
      phone: this.form.phone,
      subject: this.form.subject,
      message: this.form.message,
    };

    try {
      const response = await emailjs.send(
        "service_4i31vcn",
        "template_aizbuok",
        apipayload,
        { publicKey: '0TocvA3hn_6xpQ9SV' }
      );

      if (response.status === 200) {
        this.openSnackBar('Thank you...Your details have been submitted successfully', '');

        // ✅ reset form + reset errors
        contactForm.resetForm();
        this.isSubmitted = true;
      } else {
        this.openSnackBar('Your Details Not Submitted!', '');
      }
    } catch (error) {
      console.error(error);
      this.openSnackBar('Your Details Not Submitted!', '');
    } finally {
      this.isSubmitting = false;
      this.loading = false;
    }
  }



  ngOnDestroy() {
    // this.stopAutoPlay()
    // this.stopAutoPlay2();
  }


  setActive(section: string): void {
    this.activeSection = section;
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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  navigatetoabout() {
    this.router.navigate(["/about-us"])
  }




  goToProduct(section: string) {
    this.showProductsDropdown = false;
    this.scrollToSection(section);
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

    this.shopService.getCart().subscribe(cart => {

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

  isSubmitting = false;
  isSubmitted = false;
  async sendEmail23() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const apipayload = {
      title: "Maitreya Traders Customer contact us page ",
      name: "Maitreya Traders",
      email: this.newsletterEmail,
    };
    console.log(apipayload)
    // "service_xd7q9u7","template_slg27hy"  template_slg27hy
    let response = await emailjs.send("service_xd7q9u7", "template_slg27hy", apipayload, { publicKey: 'FXF6rxTuZE6ZIsRz2' });
    console.log(response)
    if (response.status == 200) {
      // this.submittedText = 'Your Details Submitted! We will update your email.';

      this.openSnackBar('Your Details Submitted! We will update your email.', '');

      setTimeout(() => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.resetForm();

        setTimeout(() => {
          this.isSubmitted = false;
        }, 5000);
      }, 2000);


    } else {
      // this.submittedText = 'Your Details Not Submitted!';
      this.openSnackBar('Your Details Not Submitted!', '');
    }
  }
  resetForm() {
    this.form = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    };
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
  Logout() {
    this.cartItems = [];
    localStorage.removeItem('cartItems');
    localStorage.removeItem('paymentStatus');
    this.shopService.clearCart();
    // localStorage.removeItem('Userid');
    let userid = "NotLogin";                  // 🔥 IMPORTANT
    this.CustomerService.setUserId(userid);
    this.shopService.cartCountItems.next(0);
    localStorage.clear();
    // this.openSnackBar('You’ve been logged out successfully.', '');
    this.router.navigateByUrl('/home');
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
  navigatetocontact() {
    this.router.navigate(["/ContactUs"])
  }
}

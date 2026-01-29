import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MaitreyaCustomerService } from 'src/app/services/maitreya-customer.service';
import { ShopsService } from 'src/app/services/shops.service';
import emailjs from '@emailjs/browser';
import { AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';



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
  highlights?: string[],
  isFrozen?: boolean;
  isTopHighlight?: boolean;

  isFreeItem?: boolean;
  promoId?: string;
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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  isSubmitting = false;
  isSubmitted = false;
  submittedText: string = "";
  currentSlide = 0
  autoPlayInterval: any
  @ViewChild("bestSellersScroll") bestSellersScroll!: ElementRef
  currentTestimonial = 0
  Math = Math
  baseUrl: string = '';
  showMobileMenu = false;
  showMobileProducts = false;
  @ViewChildren('animate') elements!: QueryList<ElementRef>;
  newsletterEmail: string = '';
  //search
  showSearch: boolean = false;
  searchText: string = ''
  slides: CarouselSlide[] = [
    {
      title: "100% Vegetarian/Vegan",
      titleHighlight: "frozen food",
      description: "We are committed to bringing you authentic, flavourful, and thoughtfully crafted foods that celebrate global culinary heritage.",
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
      title: "Wholesome &",
      titleHighlight: "Premium",
      description: "Sourced from the finest ingredients for your healthy lifestyle.",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.7,
      reviewCount: "15.8k Review",
      productImage: "../../../assets/fishball.avif",
      productIcon: "../../../assets/fishball.avif",
      productName: "FishBall",
      productRating: 4,
      price: "6.20",
    },
    {
      title: "Premium Quality",
      titleHighlight: "Premium ingredients",
      description: "Carefully sourced ingredients to nourish your healthy lifestyle",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.7,
      reviewCount: "15.8k Review",
      productImage: "../../../assets/vegandk.jpg",
      productIcon: "../../../assets/vegandk.jpg",
      productName: "VegHKBBQ",
      productRating: 4,
      price: "6.20",
    },
    {
      title: "Plant-Powered",
      titleHighlight: "Perfection",
      description: "Where quality ingredients meet healthy living.",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.7,
      reviewCount: "15.8k Review",
      productImage: "../../../assets/vegblack.avif",
      productIcon: "../../../assets/vegblack.avif",
      productName: "Black Fish",
      productRating: 4,
      price: "6.20",
    },
    {
      title: "Good Food, Great",
      titleHighlight: "Plants ",
      description: "Made using the finest plant-based ingredients for everyday wellness.",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.7,
      reviewCount: "15.8k Review",
      productImage: "../../../assets/SVF-ROASTED-DUCK1.jpg",
      productIcon: "../../../assets/SVF-ROASTED-DUCK1.jpg",
      productName: "Vegan Spring Roll",
      productRating: 4,
      price: "6.20",
    },
    {
      title: "High-quality sourcing for ",
      titleHighlight: "high-quality living",
      description: "Powered by high-quality, responsibly sourced plant ingredients.",
      customerAvatars: ["../../../assets/Ellipse5.png",
        "../../../assets/Ellipse6.png", "../../../assets/Ellipse7.png"],
      rating: 4.7,
      reviewCount: "15.8k Review",
      productImage: "../../../assets/mushroom1.avif",
      productIcon: "../../../assets/mushroom1.avif",
      productName: "MuttonMushroom",
      productRating: 4,
      price: "6.20",
    },
  ]


  bannerslides: any[] = [];
  currentSlide_bnr = 0;
  autoPlayInterval2: any

  newLaunchedProducts: Product[] = [];
  bestSellers: Product[] = []
  isCartOpen: boolean = false;
  cartCount: number = 0;
  activeSection: string = 'home';
  bgimage: string = '../../../assets/home_bg.png';


  @ViewChild('bs2Scroll', { static: false }) bs2Scroll!: ElementRef;

  isOfferApplicable: boolean = false;
  offerProductId = "";
  offerText: string = '';
  offerProductImage = "../../../assets/side1.png"
  buyGetPromotion: any = null;

  isLoggeIn: boolean = false;
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private shopService: ShopsService
  ) {
    this.shopService.cartCountItems.subscribe(count => {
      this.cartCount = count;
    });
  }


  setActive(section: string): void {
    this.activeSection = section;
  }

  ngOnInit() {
    this.baseUrl = this.CustomerService.baseUrl;
    this.startAutoPlay();

    this.GetAllCategories();
    this.GetHomepageData();
    // this.LoadPromoData();
    this.startAutoPlay2();
    this.newLaunchedProducts.forEach(p => {
      if (!p.selectedWeight) {
        p.selectedWeight = p.weights?.[0];
      }
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

    this.CustomerService.latestOrder$.subscribe((orders: any[]) => {
      if (orders && orders.length > 0) {
        this.isLoggeIn = true;
      }
    });


    this.subscribeCart();
  }

  ngOnDestroy() {
    this.stopAutoPlay()
    this.stopAutoPlay2();
  }

  private getBs2ScrollAmount(): number {
    const container = this.bs2Scroll?.nativeElement;
    if (!container) return 0;

    const card = container.querySelector('.bs2-card') as HTMLElement;
    if (!card) return 0;

    const styles = window.getComputedStyle(container);
    const gap = parseFloat(styles.gap || '0');

    return card.getBoundingClientRect().width + gap;
  }

  scrollBs2Left() {
    const container = this.bs2Scroll?.nativeElement;
    if (!container) return;

    const scrollAmount = this.getBs2ScrollAmount();
    if (!scrollAmount) return;

    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  scrollBs2Right() {
    const container = this.bs2Scroll?.nativeElement;
    if (!container) return;

    const scrollAmount = this.getBs2ScrollAmount();
    if (!scrollAmount) return;

    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }



  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide()
    }, 5000)
  }

  startAutoPlay2() {
    this.autoPlayInterval2 = setInterval(() => {
      this.nextSlide2()
    }, 5000)
  }
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval)
    }
  }

  stopAutoPlay2() {
    if (this.autoPlayInterval2) {
      clearInterval(this.autoPlayInterval2)
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


  nextSlide2() {
    this.currentSlide_bnr = (this.currentSlide_bnr + 1) % this.bannerslides.length
  }

  prevSlide2() {
    this.currentSlide_bnr = this.currentSlide_bnr === 0 ? this.bannerslides.length - 1 : this.currentSlide_bnr - 1
  }

  goToSlide2(index: number) {
    this.currentSlide_bnr = index
    this.stopAutoPlay2()
    this.startAutoPlay2()
  }

  get firstRowProducts() {
    return this.newLaunchedProducts.slice(0, 5);
  }
  addToCart(product: Product) {
    console.log(product)
    const w = product.selectedWeight;
    if (!w) return;

    this.shopService.addToCart({
      ...product,
      weightKey: w.weightKey,
      weightNumber: w.weightNumber,
      weightUnit: w.weightUnit,
      price: product.price,
      promoId: product.promoId,
      isFreeItem: product.isFreeItem || false
    });
    this.openSnackBar('Added to cart successfully', '');
  }


  scrollBestSellersLeft() {
    if (!this.bestSellersScroll) return;

    const container = this.bestSellersScroll.nativeElement;
    const card = container.querySelector('.product-card2') as HTMLElement;

    if (!card) return;

    const styles = window.getComputedStyle(container);
    const gap = parseInt(styles.columnGap || styles.gap || '0', 10);

    const scrollAmount = card.offsetWidth + gap;

    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }

  scrollBestSellersRight() {
    if (!this.bestSellersScroll) return;

    const container = this.bestSellersScroll.nativeElement;
    const card = container.querySelector('.product-card2') as HTMLElement;

    if (!card) return;

    const styles = window.getComputedStyle(container);
    const gap = parseInt(styles.columnGap || styles.gap || '0', 10);

    const scrollAmount = card.offsetWidth + gap;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }


  // scrollBestSellersLeft() {
  //   if (!this.bestSellersScroll) return;

  //   const container = this.bestSellersScroll.nativeElement;
  //   const card = container.querySelector('.product-card2');

  //   if (!card) return;

  //   // const cardWidth = card.offsetWidth;

  //   // container.scrollBy({
  //   //   left: -cardWidth,
  //   //   behavior: 'smooth',
  //   // });
  //   const gap = 30; // MUST match CSS gap
  //   const scrollAmount = card.offsetWidth + gap;

  //   container.scrollBy({
  //     left: -scrollAmount,
  //     behavior: 'smooth'
  //   });

  //   requestAnimationFrame(() => this.animateBestSellers());
  // }

  // scrollBestSellersRight() {
  //   if (!this.bestSellersScroll) return;

  //   const container = this.bestSellersScroll.nativeElement;
  //   const card = container.querySelector('.product-card2');

  //   if (!card) return;

  //   // const cardWidth = card.offsetWidth;


  //   // container.scrollBy({
  //   //   left: cardWidth,
  //   //   behavior: 'smooth',
  //   // });
  //   const gap = 30;
  //   const scrollAmount = card.offsetWidth + gap;

  //   container.scrollBy({
  //     left: scrollAmount,
  //     behavior: 'smooth'
  //   });

  //   requestAnimationFrame(() => this.animateBestSellers());
  // }

  reviewerAvatars: string[] = ["../../../assets/testi_1.png", "../../../assets/testi_2.png", "../../../assets/testi_3.png"]

  testimonials: Testimonial[] = [
    {
      text: "I absolutely love these plant-based delights! Every bite is fresh, flavorful, and satisfying. The variety and quality make it easy to enjoy healthy meals without compromising on taste.",
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
  showProductsDropdown = false;

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

  mapProducts(products: any[]) {
    const promo = JSON.parse(localStorage.getItem('BUY_GET_PROMO') || 'null');

    this.newLaunchedProducts = products.map((item: any, index: number): Product => {

      const weights: ProductWeight[] = (item.weightList || []).map((w: any) => ({
        ...w,
        weightKey: `${w.weightNumber}_${w.weightUnit}`
      }));

      const selectedWeight = weights[0];

      const isPromoApplicable = promo && (
        (promo.applicableOn === 'CATEGORY' && promo.applicableIds.includes(item.categoryID)) ||
        (promo.applicableOn === 'SUBCATEGORY' && promo.applicableIds.includes(item.subCategoryID))
      );

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
        price: selectedWeight?.productPrice || 0,

        discount: selectedWeight?.disCountProductprice
          ? Math.round(
            (selectedWeight.disCountProductprice / selectedWeight.productPrice) * 100
          )
          : 0,

        type: item.categoryName ? `(${item.categoryName})` : '',
        categoryId: item.categoryID,
        subcatId: item.subCategoryID,

        highlights: item.productHighlight,
        description: item.productDescription,
        isFrozen: item.isfrozenProduct || false,
        isTopHighlight: item.isTopHighlight || false,

        // ✅ PROMO FLAGS
        isFreeItem: false,
        promoId: isPromoApplicable ? promo.promotionID : null
      };
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

          /* Set banner image (first active promo) */
          this.bgimage = buyGetPromos.length
            ? this.baseUrl + buyGetPromos[0].advertisementImage
            : '';

          // Convert promos to carousel slides
          this.bannerslides = buyGetPromos.map((promo: any) => ({
            image: encodeURI(this.baseUrl + promo.advertisementImage)
          }));


          console.log(this.bannerslides)

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

          this.LoadPromoData();
          /* 🔥 NEW LAUNCHED PRODUCTS */
          this.newLaunchedProducts = posRes.NewProducts.map(
            (item: any, index: number): Product => {

              const weights: ProductWeight[] = (item.weightList || []).map((w: any) => ({
                ...w,
                weightKey: `${w.weightNumber}_${w.weightUnit}`   // 🔥 unique key
              }));

              const selectedWeight = weights[0];
              const isPromoApplicable = promo && (
                promo.applicableOn === 'CATEGORY' &&
                promo.applicableIds.includes(item.categoryID)
              );



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
                description: item.productDescription,
                isFrozen: item.isfrozenProduct || false,
                isTopHighlight: item.isHighlightedProduct || false,

                // 🎯 NEW PROMO FLAGS
                isFreeItem: !!isPromoApplicable,
                promoId: isPromoApplicable ? promo.promotionID : null
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
              const isPromoApplicable = promo && (
                promo.applicableOn === 'CATEGORY' &&
                promo.applicableIds.includes(item.categoryID)
              );


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
                description: item.productDescription,
                isFrozen: item.isfrozenProduct || false,
                isTopHighlight: item.isHighlightedProduct || false,

                // 🎯 NEW PROMO FLAGS
                isFreeItem: !!isPromoApplicable,
                promoId: isPromoApplicable ? promo.promotionID : null
              };
            }
          );
          // ✅ THIS IS THE KEY
          setTimeout(() => {
            this.animateBestSellers();
          }, 0);

          // this.resolveProductNavigation(this.bestSellers);
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

  LoadPromoData() {
    const promoList = JSON.parse(localStorage.getItem('BUY_GET_PROMO') || 'null');
    console.log("BUY GET PROMOS >>>", promoList);

    if (!promoList || !promoList.length) return;

    const promo = promoList[0]; // ✅ THIS IS IMPORTANT

    this.CustomerService.showLoader.next(true);

    const payload = {
      categoryID: promo.applicableIds?.[0],
      productID: promo.selectFreeProductID
    };

    console.log('Payload >>>', payload);

    this.CustomerService.GetPromoDataDetails(payload).subscribe(
      (posRes: any) => {
        console.log(posRes);

        if (posRes.response === 3) {
          const proproduct = posRes.ProductData;

          const Proimage =
            proproduct?.productImagesList?.length
              ? this.baseUrl + proproduct.productImagesList[0]
              : 'assets/no-image.png';

          localStorage.setItem('ForFreeItmSubID', proproduct.subCategoryID);
          localStorage.setItem('ForFreeImg', Proimage)

        } else {
          this.openSnackBar(posRes.message, '');
        }

        this.CustomerService.showLoader.next(false);
      },
      (err) => {
        this.openSnackBar(err.message, '');
        this.CustomerService.showLoader.next(false);
        console.warn(err.error);
      }
    );
  }


  // private resolveProductNavigation(products: Product[]) {
  //   const productId = localStorage.getItem('BuyXY_ProID');
  //   console.log(productId)
  //   if (!productId) return;

  //   const product = products.find(p => p.productID === productId);
  //   console.log(product)
  //   if (!product) return;

  //   localStorage.setItem('ForFreeItmCatID', product.categoryId);
  //   localStorage.setItem('ForFreeItmSubID', product.subcatId);
  // }
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
    // if (item.isFreeItem) return;
    this.shopService.updateItem({
      productID: item.productID,
      cartTitle: item.cartTitle,   // ✅ CORRECT
      locqunatity: item.locqunatity + 1
    });
    this.openSnackBar('Added to cart successfully', '');
  }
  decrementQuantity(item: any) {
    // if (item.isFreeItem) return;
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




  private getEligibleQty(): number {
    if (!this.buyGetPromotion) return 0;

    return this.cartItems
      .filter(item =>
        !item.isFreeItem &&
        this.buyGetPromotion.applicableOn === 'CATEGORY' &&
        this.buyGetPromotion.applicableIds.includes(item.categoryId)
      )
      .reduce((sum, item) => sum + item.locqunatity, 0);
  }
  private subscribeCart() {
    this.shopService.getCart().subscribe(cart => {
      // this.serverCartItems = cart;

      this.cartItems = cart.map((item: any) => ({
        id: item.itemID,
        productID: item.productID,
        name: item.categoryName,
        cartTitle: item.cartTitle,
        weightLabel: `${item.cartTitle.weightNumber} ${item.cartTitle.weightUnit}`,
        originalPrice: item.cartTitle.productPrice,
        salePrice: item.isFreeItem ? 0 : item.price,
        quantity: item.locqunatity,
        locqunatity: item.locqunatity,
        image: item.cartImage,
        categoryId: item.categoryID,
        subcatId: item.subcatID,
        isFrozen: item.isFrozen || false,
        isFreeItem: item.isFreeItem || false,
        promoId: item.promoId || null,
        isTopHighlight: item.isTopHighlight || false
      }));
    });
  }


  // async sendEmail() {
  //   if (this.isSubmitting) return;
  //   this.isSubmitting = true;
  //   await new Promise(resolve => setTimeout(resolve));

  //   const apipayload = {
  //     title: 'Subscription emails',
  //     name: 'Subscription: Request',
  //     email: this.newsletterEmail,
  //   };

  //   try {
  //     const response = await emailjs.send(
  //       'service_4i31vcn',
  //       'template_vm2sdr9',
  //       apipayload,
  //       { publicKey: '0TocvA3hn_6xpQ9SV' }
  //     );

  //     if (response.status === 200) {
  //       this.openSnackBar(
  //         'Thanks for signing up! We’re excited to have you.',
  //         ''
  //       );
  //       this.resetForm();
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     this.openSnackBar('Your Details Not Submitted!', '');
  //   } finally {
  //     this.isSubmitting = false;
  //   }
  // }


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

    setTimeout(() => {
      this.elements.forEach(el => {
        el.nativeElement.classList.remove('animate-up');
        void el.nativeElement.offsetWidth; // force reflow
        el.nativeElement.classList.add('animate-up');
      });
    }, 50);
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
  navigatetocontact() {
    this.router.navigate(["/ContactUs"])
  }

  navigatetoabout() {
    this.router.navigate(["/about-us"])
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
    let userid = "NotLogin";               // 🔥 IMPORTANT
    this.CustomerService.setUserId(userid);
    this.shopService.cartCountItems.next(0);
    localStorage.clear();
    // this.openSnackBar('You’ve been logged out successfully.', '');
    // this.router.navigateByUrl('/home');
  }


  @ViewChildren('productCard') cards!: QueryList<ElementRef>;
  @ViewChildren('bestSellerCard') bestSellerCards!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    this.GetHomepageData();
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

    this.elements?.forEach(el =>
      observer.observe(el.nativeElement)
    );

    this.cards?.changes.subscribe(() => {
      this.cards.forEach(card =>
        observer.observe(card.nativeElement)
      );
    });

    this.cards?.forEach(card =>
      observer.observe(card.nativeElement)
    );

    // ===== BEST SELLERS: NO OBSERVER =====
    this.animateBestSellers();
  }

  animateBestSellers(): void {
    if (!this.bestSellerCards || this.bestSellerCards.length === 0) return;

    // Reset animation
    this.bestSellerCards.forEach(card => {
      card.nativeElement.classList.remove('show');
    });

    // Trigger animation in next paint cycle (BEST way)
    requestAnimationFrame(() => {
      this.bestSellerCards.forEach(card => {
        card.nativeElement.classList.add('show');
      });
    });
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


}


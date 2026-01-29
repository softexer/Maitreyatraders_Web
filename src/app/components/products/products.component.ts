import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MaitreyaCustomerService } from 'src/app/services/maitreya-customer.service';
import { ShopsService } from 'src/app/services/shops.service';
import emailjs from '@emailjs/browser';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, QueryList, ViewChildren } from '@angular/core';

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
interface CartProduct {
  productID: string;
  selectedWeight: ProductWeight;
  price: number;
}

interface ProductWeight {
  productPrice: number;
  disCountProductprice: number;
  weightNumber: number;
  weightUnit: string;
  weightKey?: string;
}

interface Product extends CartProduct {
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
  route: string;
  image?: string;
  subCategories: SubCategory[];
}


interface SubCategory {
  id: string
  name: string
  image?: string;
}

interface ProductPreview extends CartProduct {
  id: number;
  productID: string;
  type: string;
  name: string;
  subtitle?: string;
  image?: string;
  productImagesList?: string[];
  discount?: number;
  originalPrice: number;
  price: number;
  weights: ProductWeight[];
  selectedWeight: ProductWeight;
  categoryId?: string;
  subcatId: string;
  description?: string[];
  highlights?: string[];
  isFrozen?: boolean;
  isTopHighlight?: boolean;
}


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  isSubmitting = false;
  isSubmitted = false;
  submittedText: string = "";
  currentSlide = 0
  autoPlayInterval: any
  @ViewChild("bestSellersScroll") bestSellersScroll!: ElementRef
  currentTestimonial = 0
  Math = Math;
  selectedCategoryId: string | null = null;
  IsProductView_old: boolean = false;
  slides: CarouselSlide[] = [
    {
      title: "100% vegetarian/vegan",
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
      title: "Delicious organic",
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
      title: "Premium quality",
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

  IsProductView: boolean = false;
  baseUrl: string = "";
  activeSection: string = 'products';
  titleFirstPart: string = '';
  titleSecondPart: string = '';
  selectedImage = ''
  selectedProduct!: ProductPreview;
  cartCount: number = 0;

  Subcategories: SubCategory[] = []
  newLaunchedProducts: Product[] = []
  allProducts: Product[] = []
  selectedCategory = 2


  productCategories: ProductCategory[] = []
  selectedMainCategoryId: string | null = null;
  selectedSubCategoryId: string | null = null;
  isLoggeIn: boolean = false;


  showMobileMenu = false;
  showMobileProducts = false;

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

  @Output() openCart = new EventEmitter<MouseEvent>();

  ISViewPage: boolean = false;
  @Input() selectedType: Array<{ type: string; operation: string }> = [];
  @Output() closeEvent = new EventEmitter();
  dataobj: any;

  selectedIndex = 0;




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
    // this.IsProductView = false;
    this.startAutoPlay();
    this.GetAllCategories();

    this.newLaunchedProducts.forEach(p => {
      if (!p.selectedWeight) {
        p.selectedWeight = p.weights?.[0];
      }
    });

    this.subscribeCart();

    if (this.selectedType && this.selectedType.length > 0) {
      this.dataobj = this.selectedType[0]
      if (this.selectedType[0].operation === 'ViewFrmHome') {
        this.dataobj = this.selectedType[0]
        console.log(this.dataobj)
        // this.IsProductView = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.ViewToProductDetails_home(this.dataobj.sendobj)
      }
    }

    if (this.selectedProduct?.productImagesList?.length) {
      this.selectedImage = this.selectedProduct.productImagesList[0];
    }
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


  navigatetocontact() {
    this.router.navigate(["/ContactUs"])
  }
  ngOnDestroy() {
    this.stopAutoPlay()
  }
  cartpage(event: MouseEvent) {
    event.stopPropagation();
    if (this.cartCount > 0) {
      this.CustomerService.open();
    }
  }
  setActive(section: string): void {
    // this.IsProductView = false;  
    this.closeEvent.emit(false);
    this.showProductsDropdown = false;
    this.activeSection = section;

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

    this.openSnackBar('Added to cart successfully', '');
  }

  // Add to cart functionality
  addToCart2(product: any): void {
    console.log("selprd", product);
    const w = product.selectedWeight;
    if (!w) return;

    this.shopService.addToCart({
      ...product,
      weightKey: w.weightKey,
      weightNumber: w.weightNumber,
      weightUnit: w.weightUnit,
      price: product.price
    });
    this.openSnackBar('Added to cart successfully', '');
  }
  showHighlight = false;
  showDescription = false;
  IsClickedfrmproducts: boolean = false;

  ViewToProductDetails(product: Product) {
    console.log(product)
    this.IsProductView = true;
    this.IsClickedfrmproducts = true;
    this.showHighlight = false; // reset showHighlight = false;
    this.showDescription = false;
    const firstWeight = product.weights?.[0];

    this.selectedProduct = {
      ...product,

      weights: product.weights || [],
      selectedWeight: firstWeight,

      originalPrice: firstWeight?.productPrice || 0,
      price: firstWeight
        ? firstWeight.productPrice - (firstWeight.disCountProductprice || 0)
        : 0,

      discount: firstWeight?.disCountProductprice
        ? Math.round(
          (firstWeight.disCountProductprice / firstWeight.productPrice) * 100
        )
        : 0,

      highlights: typeof product.highlights === 'string'
        ? (product.highlights as string).split('.').filter((h: any) => h.trim())
        : product.highlights || [],

      description: typeof product.description === 'string'
        ? (product.description as string).split('.').filter((h: any) => h.trim())
        : product.description || []
    };

    this.selectedImage =
      this.selectedProduct.productImagesList?.[0] || 'assets/no-image.png';

    setTimeout(() => {
      this.showHighlight = true;
      this.observeDescription(); // start observing
    }, 50);
  }

  ViewToProductDetails_home(product: Product) {
    console.log(product)
    this.IsProductView = true;
    this.showHighlight = false; // reset showHighlight = false;
    this.showDescription = false;
    const firstWeight = product.weights?.[0];

    this.selectedProduct = {
      ...product,

      weights: product.weights || [],
      selectedWeight: firstWeight,

      originalPrice: firstWeight?.productPrice || 0,
      price: firstWeight
        ? firstWeight.productPrice - (firstWeight.disCountProductprice || 0)
        : 0,

      discount: firstWeight?.disCountProductprice
        ? Math.round(
          (firstWeight.disCountProductprice / firstWeight.productPrice) * 100
        )
        : 0,

      highlights: typeof product.highlights === 'string'
        ? (product.highlights as string).split('.').filter((h: any) => h.trim())
        : product.highlights || [],

      description: typeof product.description === 'string'
        ? (product.description as string).split('.').filter((h: any) => h.trim())
        : product.description || []
    };

    this.selectedImage =
      this.selectedProduct.productImagesList?.[0] || 'assets/no-image.png';

    setTimeout(() => {
      this.showHighlight = true;
      this.observeDescription(); // start observing
    }, 50);
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
    if (!element) return;

    const headerHeight = 50; // 🔥 your fixed header height
    const extraSpacing = 10; // optional gap below header

    const yOffset = -(headerHeight + extraSpacing);

    const y =
      element.getBoundingClientRect().top +
      window.pageYOffset +
      yOffset;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  }

  showProductsDropdown = false;

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
    khNo: '71-75 Shelton Street, Covent Garden, London,,',
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


  selectCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
    const selected = this.productCategories.find(c => c.id === categoryId);
    this.Subcategories = selected?.subCategories || [];
    console.log(this.Subcategories)
  }
  getCategoryTitle(): string {
    const category = this.Subcategories.find(
      (c) => c.id === String(this.selectedCategory)
    );

    return category
      ? category.name.replace('Frozen ', '')
      : 'Products';
  }


  // // Offer Section
  offerText = "Buy 3 Canned Product Get 1 Free Soya Chaap"
  offerProductImage = "../../../assets/side1.png"

  // Brand Logos - Local paths
  brandLogos = [
    { src: "../../../assets/quality_brd.png", alt: "Quality Certified" },
    { src: "../../../assets/trus_brd.png", alt: "Trusted Seller" },
    { src: "../../../assets/secu_brd.png", alt: "Secure Payment" },
  ]
  // Select image from thumbnails
  selectImage(image: string, index: number): void {
    this.selectedImage = image
    console.log("[v0] Selected image:", image)
    this.selectedImage = image;
    this.selectedIndex = index;
  }


  prevImage() {
    const images = this.selectedProduct.productImagesList;
    if (!images || images.length === 0) return;
    this.selectedIndex =
      this.selectedIndex === 0 ? images.length - 1 : this.selectedIndex - 1;
    this.selectedImage = images[this.selectedIndex];
  }

  nextImage() {
    const images = this.selectedProduct.productImagesList;
    if (!images || images.length === 0) return;
    this.selectedIndex =
      this.selectedIndex === images.length - 1 ? 0 : this.selectedIndex + 1;
    this.selectedImage = images[this.selectedIndex];
  }


  // Navigate to products page on + button click
  navigateToProducts(): void {
    console.log("[v0] Navigating to products page")
    this.router.navigate(["/products"])
  }
  cartItems: any[] = [];

  // getCartItem(product: Product) {
  getCartItem(product: CartProduct) {
    if (!product.selectedWeight) return null;

    return this.cartItems.find(item =>
      item.productID === product.productID &&
      item.cartTitle?.weightNumber === product.selectedWeight.weightNumber &&
      item.cartTitle?.weightUnit === product.selectedWeight.weightUnit
    );
  }
  // isInCart(product: Product): boolean {
  isInCart(product: CartProduct): boolean {
    return !!this.getCartItem(product);
  }

  incrementQuantity(item: any) {
    this.shopService.updateItem({
      productID: item.productID,
      cartTitle: item.cartTitle,   // ✅ CORRECT
      locqunatity: item.locqunatity + 1
    });
    this.openSnackBar('Added to cart successfully', '');
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

  private subscribeCart() {
    this.shopService.getCart().subscribe(cart => {
      this.cartItems = cart.map((item: any) => ({
        id: item.itemID,
        productID: item.productID,
        name: item.categoryName,

        cartTitle: item.cartTitle,   // 👈 REQUIRED

        weightLabel: `${item.cartTitle.weightNumber} ${item.cartTitle.weightUnit}`,

        originalPrice: item.cartTitle.productPrice,
        salePrice: item.price,

        quantity: item.locqunatity,
        locqunatity: item.locqunatity,

        image: item.cartImage,
        categoryId: item.categoryID,
        subcatId: item.subcatID,
        isFrozen: item.isFrozen || false,
        isTopHighlight: item.isTopHighlight || false
      }));

    });
  }
  GetAllCategories() {
    this.CustomerService.showLoader.next(true);

    this.CustomerService.LoadAllCategories().subscribe(
      (res: any) => {
        console.log(res)
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
          console.log(this.productCategories)
          const storedCategoryId = localStorage.getItem("CategoryID");
          const matchedCategory = this.productCategories.find(
            cat => cat.id === storedCategoryId
          );

          if (matchedCategory) {
            console.log(matchedCategory);
            const nameParts = matchedCategory.name.trim().split(' ');

            this.titleFirstPart = nameParts[0] || '';
            this.titleSecondPart = nameParts.slice(1).join(' ') || '';

            this.selectCategory(matchedCategory.id);
            this.selectMainCategory(matchedCategory.id);

          } else if (this.productCategories.length) {
            const fallbackName = this.productCategories[0].name.trim().split(' ');
            this.titleFirstPart = fallbackName[0];
            this.titleSecondPart = fallbackName.slice(1).join(' ');

            this.selectCategory(this.productCategories[0].id);
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

  storedSubCatId: string | null = '';
  selectMainCategory(categoryId: string) {
    this.selectedMainCategoryId = categoryId;
    this.storedSubCatId = localStorage.getItem('SerhSubCat') || null;

    const category = this.productCategories.find(c => c.id === categoryId);
    this.Subcategories = category?.subCategories || [];

    if (!this.Subcategories.length) {
      this.newLaunchedProducts = [];
      return;
    }

    // 🔑 Prefer stored sub-category if it exists in this category
    const matchedSubCat = this.storedSubCatId
      ? this.Subcategories.find(sc => sc.id === this.storedSubCatId)
      : null;

    const subCatToSelect = matchedSubCat
      ? matchedSubCat.id
      : this.Subcategories[0].id;

    this.selectSubCategory(subCatToSelect);
  }

  selectSubCategory(subCategoryId: string) {
    this.selectedSubCategoryId = subCategoryId;

    console.log(this.IsClickedfrmproducts)
    if (this.IsClickedfrmproducts) {
      this.IsProductView = false;
    }

    // persist selection (optional but recommended)
    localStorage.setItem('SerhSubCat', subCategoryId);

    this.newLaunchedProducts = [];
    this.GetSubCategoryProducts(subCategoryId);

    // const searchPD = localStorage.getItem('SearchProHm');

    // if (searchPD) {
    //   console.log(searchPD);
    //   this.ViewToProductDetails()
    // }

  }

  GetSubCategoryProducts(subCategoryId: string) {
    let payload = {
      productID: "All",
      subCategoryID: subCategoryId
    }
    this.CustomerService.showLoader.next(true);

    this.CustomerService.GetProducts_Of_Subcats(payload).subscribe(
      (res: any) => {
        console.log(res)
        if (res.response === 3 && res.ProductDetails?.length) {
          localStorage.removeItem('SerhSubCat');
          const mappedProducts: Product[] = res.ProductDetails.map(
            (item: any, index: number) => {

              // ✅ STEP 1: Sort weights (g < kg)
              const sortedWeights = (item.weightList || []).slice().sort((a: any, b: any) => {
                const toGrams = (w: any) =>
                  w.weightUnit === 'kg' ? w.weightNumber * 1000 : w.weightNumber;
                return toGrams(a) - toGrams(b);
              });

              // ✅ STEP 2: Pick smallest weight
              const defaultWeight = sortedWeights[0];

              return {
                id: index + 1,
                type: item.categoryName ? `(${item.categoryName})` : '',
                name: item.productName,
                subtitle: item.subCategoryName ? `(${item.subCategoryName})` : '',
                image:
                  item.productImagesList?.length && item.productImagesList[0]
                    ? this.baseUrl + item.productImagesList[0]
                    : 'assets/no-image.png',

                productImagesList: item.productImagesList?.length
                  ? item.productImagesList.map((img: string) => this.baseUrl + img)
                  : ['assets/no-image.png'],

                categoryId: item.categoryID,
                subcatId: item.subCategoryID,
                productID: item.productID,

                // 🔥 UPDATED PART
                weights: sortedWeights,
                selectedWeight: defaultWeight,

                originalPrice: defaultWeight?.productPrice || item.productPrice,
                price:
                  defaultWeight
                    ? defaultWeight.productPrice -
                    (defaultWeight.disCountProductprice || 0)
                    : item.productPrice || 0,

                discount:
                  defaultWeight?.disCountProductprice
                    ? Math.round(
                      (defaultWeight.disCountProductprice / defaultWeight.productPrice) * 100
                    )
                    : 0,

                highlights: item.productHighlight,
                description: item.productDescription,
                isFrozen: item.isfrozenProduct || false,
                isTopHighlight: item.isHighlightedProduct || false,
                isFreeItem: false,
                promoId: null
              };
            }
          );



          mappedProducts.sort((a, b) => Number(b.isTopHighlight) - Number(a.isTopHighlight));

          this.newLaunchedProducts = [
            ...this.newLaunchedProducts,
            ...mappedProducts
          ];
          this.LoadPromoData();

          const searchPD = localStorage.getItem('SearchProHm');
          if (searchPD) {
            const matchedProduct = this.newLaunchedProducts.find(
              (p: any) => p.productID === searchPD
            );

            if (matchedProduct) {
              console.log("Matched Product:", matchedProduct);
              this.ViewToProductDetails(matchedProduct);
              localStorage.removeItem('SearchProHm'); 
            }
          }


        } else {
          this.openSnackBar(res.message, '');
        }
        this.CustomerService.showLoader.next(false);

      },
      (err) => {
        this.openSnackBar(err.message, '');
        this.CustomerService.showLoader.next(false);
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


  onWeightChange(product: {
    selectedWeight: {
      productPrice: number;
      disCountProductprice?: number;
    };
    originalPrice: number;
    price: number;
    discount?: number;
  }) {
    const w = product.selectedWeight;
    if (!w) return;

    product.originalPrice = w.productPrice;
    product.price = w.productPrice - (w.disCountProductprice || 0);

    product.discount = w.disCountProductprice
      ? Math.round((w.disCountProductprice / w.productPrice) * 100)
      : 0;
  }

  onWeightChange2(product: Product) {
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
  //  onWeightChange(product: Product) {
  //   const w = product.selectedWeight;

  //   product.originalPrice = (w.productPrice || 0);

  //   product.price =
  //     w.disCountProductprice && w.disCountProductprice > 0
  //       ? w.disCountProductprice
  //       : w.productPrice || 0;
  // }
  private getDiscount(value: any): number {
    if (!value || typeof value !== 'string') {
      return 0;
    }

    const numericValue = value.replace(/[^0-9]/g, '');

    return numericValue ? Number(numericValue) : 0;
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
    this.IsProductView = false;
    this.GetAllCategories();

  }

  setProduct(section: string): void {
    this.activeSection = section
    this.router.navigate(["/products"])
  }
  newsletterEmail: string = '';

  sendEmail2() {
    if (!this.newsletterEmail) {
      this.openSnackBar('Please enter email', '');
      return;
    }

    this.openSnackBar('Send to email in progress', '');

    // 👉 call API / EmailJS here

    // ✅ clear input after snackbar
    this.newsletterEmail = '';
  }


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
    this.GetAllCategories();
    this.closeSearch();
  }
  gotoAllProducts() {
    // this.router.navigate(["/products"])
  }

  closeSearch() {
    this.showSearch = false;
    this.searchText = "";
    this.displaylist = false;
  }

  closeDetails() {
    console.log("erewrewrew")
    this.closeEvent.emit(false);
    this.IsProductView = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  navigateorders() {
    this.router.navigate(["/OrderSummary"])
  }
  Logout() {
    this.cartItems = [];
    localStorage.removeItem('cartItems');
    localStorage.removeItem('paymentStatus');
    this.shopService.clearCart();
    // localStorage.removeItem('Userid');
    let userid = "NotLogin";                 // 🔥 IMPORTANT
    this.CustomerService.setUserId(userid);
    this.shopService.cartCountItems.next(0);
    localStorage.clear();
    // this.openSnackBar('You’ve been logged out successfully.', '');
    this.router.navigateByUrl('/home');
  }

  @ViewChildren('productCard') cards!: QueryList<ElementRef>;
  @ViewChildren('animate') elements!: QueryList<ElementRef>;
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

  }

  @ViewChild('descriptionSection') descriptionSection!: ElementRef;



  observeDescription() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.showDescription = true;
          observer.disconnect(); // animate only once
        }
      });
    }, { threshold: 0.25 });

    observer.observe(this.descriptionSection.nativeElement);
  }

  toProduct(preview: ProductPreview): Product {
    return {
      ...preview,
      weights: preview.weights || [],
      selectedWeight: preview.selectedWeight
    } as Product;
  }

}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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

interface Product {
  // id: number
  // name: string
  // subtitle?: string
  // image: string
  // discount: number
  // originalPrice: string
  // price: string
  // weights: string[]
  // selectedWeight: string
  // categoryId: number
  // subcatId: number
  // productID: string

  id: number
  productID: string
  name: string
  subtitle?: string
  image: string
  productImagesList?: string[]
  originalPrice: string
  price: number
  weights: string[]
  selectedWeight: string
  discount?: number
  type: string
  categoryId: number
  subcatId: number
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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSlide = 0
  autoPlayInterval: any
  @ViewChild("bestSellersScroll") bestSellersScroll!: ElementRef
  currentTestimonial = 0
  Math = Math
  baseUrl: string = '';
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


  newLaunchedProducts: Product[] = [];
  bestSellers: Product[] = []
  isCartOpen: boolean = false;
  cartCount: number = 0;
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

  activeSection: string = 'home';

  setActive(section: string): void {
    this.activeSection = section;
  }

  ngOnInit() {
    this.baseUrl = this.CustomerService.baseUrl;
    this.startAutoPlay();
    this.GetHomepageData();
    this.GetAllCategories();
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
    console.log("[v0] Adding to cart:", product.name, product.selectedWeight)
    this.shopService.addToCart(product);
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
  companyDescription = 'Lorem ipsum dolor sit amet consectetur. Aenean malesuada tincidunt cursetur phasellus.';

  // Quick Links
  quickLinks = [
    { label: 'Home', sectionId: 'home' },
    { label: 'About', sectionId: 'about' },
    { label: 'Products', sectionId: 'products' },
    { label: 'Recipes', sectionId: 'recipes' },
    { label: 'Blog', sectionId: 'blog' }

  ];

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
  // isCartOpen: boolean = false;
  @Output() openCart = new EventEmitter<MouseEvent>();
  cartpage(event: MouseEvent) {
    event.stopPropagation();
    // this.router.navigate(['/cart']);
    // this.openCart.emit(event);
    this.CustomerService.open();
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
            (item: any, index: number): Product => ({
              // id: index + 1,
              // name: item.productName,
              // subtitle: item.subCategoryName ? `(${item.subCategoryName})` : '',
              // image: item.productImagesList?.length
              //   ? `${this.baseUrl}${item.productImagesList[0]}`
              //   : 'assets/no-image.png',
              // // discount: item.offerPercentage ? Number(item.offerPercentage) : 0,
              // discount: this.getDiscount(item.offerPercentage),
              // originalPrice: item.productPrice.toFixed(2),
              // price:
              //   item.disCountProductprice && item.disCountProductprice > 0
              //     ? item.disCountProductprice.toFixed(2)
              //     : item.productPrice.toFixed(2),
              // weights: item.weightList?.length
              //   ? item.weightList
              //   : ['450 g', '900 g', '1350 g'],
              // selectedWeight: item.weightList?.length
              //   ? item.weightList[0]
              //   : '450 g',
              // categoryId: item.categoryID,
              // subcatId: item.subCategoryID,
              // productID: item.productID

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
                : item.image
                  ? [item.image]
                  : ['assets/no-image.png'],

              discount: this.getDiscount(item.offerPercentage),
              originalPrice: item.productPrice,
              price: item.disCountProductprice > 0
                ? item.disCountProductprice
                : item.productPrice,
              weights: item.weightList || [],
              selectedWeight: item.weightList?.[0] || '',
              categoryId: item.categoryID,
              subcatId: item.subCategoryID,
              productID: item.productID

            })
          );

          /* 🔥 BEST SELLERS */
          this.bestSellers = posRes.BestSalesProductsData.map(
            (item: any, index: number): Product => ({
              // id: index + 1,
              // name: item.productName,
              // image: item.productImagesList?.length
              //   ? `${this.baseUrl}${item.productImagesList[0]}`
              //   : 'assets/no-image.png',
              // // discount: item.offerPercentage ? Number(item.offerPercentage) : 0,
              // discount: this.getDiscount(item.offerPercentage),
              // originalPrice: item.productPrice.toFixed(2),
              // price:
              //   item.disCountProductprice && item.disCountProductprice > 0
              //     ? item.disCountProductprice.toFixed(2)
              //     : item.productPrice.toFixed(2),
              // weights: item.weightList?.length
              //   ? item.weightList
              //   : ['420 g', '840 g', '1260 g'],
              // selectedWeight: item.weightList?.length
              //   ? item.weightList[0]
              //   : '420 g',
              // categoryId: item.categoryID,
              // subcatId: item.subCategoryID,
              // productID: item.productID

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
                : item.image
                  ? [item.image]
                  : ['assets/no-image.png'],

              discount: this.getDiscount(item.offerPercentage),
              originalPrice: item.productPrice,
              price: item.disCountProductprice > 0
                ? item.disCountProductprice
                : item.productPrice,
              weights: item.weightList || [],
              // selectedWeight: item.weightList?.[0] || '',
              selectedWeight: item.weightList?.length
                ? item.weightList[0]
                : '420 g',
              categoryId: item.categoryID,
              subcatId: item.subCategoryID,
              productID: item.productID
            })
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

  //  showProductsDropdown = false



}


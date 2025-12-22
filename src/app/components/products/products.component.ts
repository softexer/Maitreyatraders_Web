import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
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
  route: string;
  image?: string;
  subCategories: SubCategory[];
}


interface SubCategory {
  id: string
  name: string
  image?: string;
}

interface ProductPreview {
  id: number;
  type: string;
  name: string;
  subtitle?: string;
  image?: string;              // main image from API
  productImagesList?: string[]; // optional multiple images

  discount?: number;
  originalPrice: number;
  price: number;
  weights: string[];
  selectedWeight?: string;
  categoryId?: string;
  description?: string[];
  highlights?: string[];
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  currentSlide = 0
  autoPlayInterval: any
  @ViewChild("bestSellersScroll") bestSellersScroll!: ElementRef
  currentTestimonial = 0
  Math = Math;
  selectedCategoryId: string | null = null;
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

  // productImages: string[] = []
  selectedImage = ''

  // productName = ''
  // originalPrice = ''
  // currentPrice = ''

  // weightOptions: string[] = []
  // selectedWeight = ''

  // productHighlights: string[] = []
  // productDescription: string[] = []
  selectedProduct!: ProductPreview;
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private CustomerService: MaitreyaCustomerService,
    private shopService: ShopsService
  ) { }

  @Output() openCart = new EventEmitter<MouseEvent>();

  cartpage(event: MouseEvent) {
    event.stopPropagation();
    // this.router.navigate(['/cart']);
    // this.openCart.emit(event);
     this.CustomerService.open();
  }
  setActive(section: string): void {
    this.activeSection = section;
    this.showProductsDropdown = false;
  }

  ngOnInit() {
    this.baseUrl = this.CustomerService.baseUrl;
    this.IsProductView = false;
    this.startAutoPlay();
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

  addToCart(product: any) {
    console.log(product)
    this.shopService.addToCart(product);
  }


  ViewToProductDetails(product: any) {
    console.log("[v0] Product selected:", product);

    this.IsProductView = true;

    this.selectedProduct = {
      id: product.id,
      type: product.type,
      name: product.name,
      subtitle: product.subtitle,
      image: product.image,
      productImagesList: product.productImagesList?.length
        ? product.productImagesList.map((img: string) => img)
        : product.image
          ? [product.image]
          : ['assets/no-image.png'],

      discount: product.discount,
      originalPrice: Number(product.originalPrice),
      price: Number(product.price),
      weights: product.weights || [],
      selectedWeight: product.selectedWeight || product.weights?.[0],
      categoryId: product.categoryId,
      highlights: product.highlights ?? [
        'High-quality premium product',
        'Fresh and carefully selected',
        'Perfect for daily use'
      ],
      description: product.description ?? [
        'This product is crafted with care using premium ingredients.'
      ]
    };

    this.selectedImage = this.selectedProduct.productImagesList?.[0] || 'assets/no-image.png';

    this.IsProductView = true;

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
  // scrollToSection(sectionId: string): void {
  //   const element = document.getElementById(sectionId);
  //   if (element) {
  //     element.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'start'
  //     });
  //   }
  // }
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


  Subcategories: SubCategory[] = []
  newLaunchedProducts: Product[] = []
  allProducts: Product[] = [
  ]

  selectedCategory = 2
  filteredProducts: Product[] = []
  paginatedProducts: Product[] = []

  currentPage = 1
  itemsPerPage = 6
  totalPages = 1


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

  // productImages: string[] = [
  //   "../../../assets/blur1.png",
  //   "../../../assets/side1.png",
  //   "../../../assets/side2.png",
  // ]

  // selectedImage: string = this.productImages[0]

  // // Product Information
  // productName = "Mock Chicken"
  // originalPrice = "£ 6.00"
  // currentPrice = "£ 6.50"

  // // Weight Options
  // weightOptions: string[] = ["250 g", "450 g", "500 g", "750 g"]
  // selectedWeight = "450 g"

  // // Product Highlights
  // productHighlights: string[] = [
  //   "Indulge guilt-free in the delectable taste of vegan mock chicken, a plant-based delight.",
  //   "Elevate your meals with the savory satisfaction of canned vegan mock chicken.",
  //   "Savor the protein-packed goodness of mock chicken in every convenient can.",
  //   "From stir-fries to sandwiches, explore versatile creations with canned vegan mock chicken.",
  // ]

  // // Offer Section
  offerText = "Buy 3 Canned Product Get 1 Free Soya Chaap"
  offerProductImage = "../../../assets/side1.png"

  // Brand Logos - Local paths
  brandLogos = [
    { src: "../../../assets/quality_brd.png", alt: "Quality Certified" },
    { src: "../../../assets/trus_brd.png", alt: "Trusted Seller" },
    { src: "../../../assets/secu_brd.png", alt: "Secure Payment" },
  ]

  // Product Description
  // productDescription: string[] = [
  //   "The emergence of plant-based chicken alternatives has ushered in a delightful culinary revolution, providing a novel experience that closely mimics the taste, texture, and appearance of traditional chicken, all while remaining entirely vegetarian.",
  //   "Crafted from an assortment of plant-based ingredients, these alternatives offer a cruelty-free and ethical option for individuals who adhere to vegetarian or vegan dietary preferences.",
  //   "One of the standout benefits of these mock chicken products is their health-conscious profile. Compared to conventional chicken, they tend to contain lower levels of cholesterol and saturated fat, making them a heart-healthy choice.",
  //   "However, they don't compromise on protein content, and they often provide an abundant source of plant-based protein. This not only supports muscle growth and repair but also contributes to an overall balanced diet.",
  //   "Furthermore, plant-based chicken alternatives frequently incorporate dietary fiber and other essential nutrients, contributing to a nutritionally robust choice for those looking to maintain a wholesome diet.",
  //   "Whether you're a dedicated vegetarian, a flexitarian exploring plant-based options, or simply seeking a healthier alternative to traditional chicken, these innovative products offer a tasty, ethical, and nutritious solution that aligns with both your values and your well-being.",
  // ]

  // Select image from thumbnails
  selectImage(image: string): void {
    this.selectedImage = image
    console.log("[v0] Selected image:", image)
  }

  // Handle weight change
  onWeightChange(): void {
    // console.log("[v0] Selected weight:", this.selectedWeight)
  }

  // Add to cart functionality
  addToCart2(product: any): void {
    console.log("selprd", product);
    //  let obj = {
    //   categoryID: product.categoryId,
    //   // itemID: product.bookstoreID,
    //   qunatity: 1,
    //   locqunatity: 1,
    //   categoryName: product.name,
    //   price: product.price,
    //   cartImage: product.image,
    //   cartTitle: product.type,
    //   // typeOfBook: "BookStore",
    //   // booksList: [],
    //   deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime()
    // }
    this.shopService.addToCart(product);
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
          // OPTIONAL: auto-select first category
          // if (this.productCategories.length) {
          //   this.selectCategory(this.productCategories[0].id);
          // }

          // if (this.productCategories.length) {
          //   this.selectMainCategory(this.productCategories[0].id);
          // }
          // 🔥 GET categoryId from localStorage
          const storedCategoryId = localStorage.getItem("CategoryID");

          // 🔥 FIND matching category
          const matchedCategory = this.productCategories.find(
            cat => cat.id === storedCategoryId
          );

          if (matchedCategory) {
            console.log(matchedCategory);

            // ✅ Split category name dynamically
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

  selectMainCategory(categoryId: string) {
    this.selectedMainCategoryId = categoryId;

    const category = this.productCategories.find(c => c.id === categoryId);
    this.Subcategories = category?.subCategories || [];

    // 🔥 Auto-select first subcategory
    if (this.Subcategories.length) {
      this.selectSubCategory(this.Subcategories[0].id);
    } else {
      this.newLaunchedProducts = [];
    }
  }
  selectSubCategory(subCategoryId: string) {
    this.selectedSubCategoryId = subCategoryId;

    // reset products before loading new ones
    this.newLaunchedProducts = [];

    this.GetSubCategoryProducts(this.selectedSubCategoryId);
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

          const mappedProducts: Product[] = res.ProductDetails.map(
            (item: any, index: number) => ({
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

          // 🔥 APPEND response to existing array
          this.newLaunchedProducts = [
            ...this.newLaunchedProducts,
            ...mappedProducts
          ];

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
  private getDiscount(value: any): number {
    if (!value || typeof value !== 'string') {
      return 0;
    }

    const numericValue = value.replace(/[^0-9]/g, '');

    return numericValue ? Number(numericValue) : 0;
  }
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
    console.log("[v0] Navigating to category:", category)
    localStorage.setItem("CategoryID", category.id.toString());
    this.activeSection = "products"
    this.showProductsDropdown = false;
    this.IsProductView = false;
    // this.router.navigate(["/products"])
    this.GetAllCategories();

  }

  setProduct(section: string): void {
    this.activeSection = section
    this.router.navigate(["/products"])
  }

  // cartpage(event: Event) {
  //   console.log("22")
  //   //  event.preventDefault();   // 🔥 REQUIRED
  //   event.stopPropagation();
  //   this.router.navigate(['/cart']);
  // }
}

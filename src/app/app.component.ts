import { Component, ViewChild, ElementRef, HostListener } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { MaitreyaCustomerService } from "./services/maitreya-customer.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Maitreya-Customer';
  loading: boolean = false;

   isCartOpen = false;




  
  constructor(
    private router: Router,
    private customerservice: MaitreyaCustomerService,
    private activatedRoute: ActivatedRoute) {
    this.customerservice.showLoader.subscribe((flag: boolean) => {
      if (this.loading !== flag) {
        this.loading = flag;
      }
    });
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
    ngOnInit() {
    this.customerservice.isOpen$.subscribe(v => this.isCartOpen = v);
  }
  closeCart() {
    this.customerservice.close();
  }
  
// isCartOpen = false;

//   openCart(event?: MouseEvent) {
//     event?.stopPropagation();
//     this.isCartOpen = true;
//     document.body.style.overflow = 'hidden';
//   }

//   closeCart() {
//     this.isCartOpen = false;
//     document.body.style.overflow = '';
//   }
}

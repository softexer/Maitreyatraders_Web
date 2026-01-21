import { Component, ViewChild, ElementRef, HostListener, OnInit } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { MaitreyaCustomerService } from "./services/maitreya-customer.service";
import { AfterViewInit, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Maitreya-Customer';
  loading: boolean = false;

  isCartOpen = false;


  @ViewChildren('animate') elements!: QueryList<ElementRef>;



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


}

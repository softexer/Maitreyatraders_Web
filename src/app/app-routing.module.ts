import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/products.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { CheckoutPageComponent } from './components/checkout-page/checkout-page.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { TermsComponent } from './components/terms/terms.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { ContactusComponent } from './components/contactus/contactus.component';

const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "products", component: ProductsComponent },
  { path: "cart", component: ShoppingCartComponent },
  { path: "checkout", component: CheckoutPageComponent },
  { path: "about-us", component: AboutUsComponent },
  {  path: 'terms/:type', component: TermsComponent },
  { path: "OrderSummary", component: OrderSummaryComponent },
  { path: "ContactUs", component: ContactusComponent },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

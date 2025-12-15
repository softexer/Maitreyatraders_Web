import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { TestPageComponent } from './components/test-page/test-page.component';



const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterPageComponent },
  { path: "dashboard", component: StatisticsComponent },
  { path: "exam", component: TestPageComponent },
  // { path: "products", component: ProductsComponent },
  // { path: "whowe", component: WhoWeComponent },
  // { path: "whatwe", component: WhatWeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

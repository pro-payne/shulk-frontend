import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  // Landing Pages
  { path: 'index', loadChildren: () => import('./components/main/landing-pages/home/home.module').then(mod => mod.HomeModule) },
  { path: '', pathMatch: 'full', redirectTo: '/index' },
  { path: 'about', loadChildren: () => import('./components/main/landing-pages/about/about.module').then(mod => mod.AboutModule) },
  { path: 'partners', loadChildren: () => import('./components/main/landing-pages/partners/partners.module').then(mod => mod.PartnersModule) },

  // Auth Module
  { path: 'account', loadChildren: () => import('./components/main/auth/auth.module').then(mod => mod.AuthModule) },
  { path: 'account', pathMatch: 'full', redirectTo: '/account/signin' },
  { path: 'login', pathMatch: 'full', redirectTo: '/account/signin' },
  { path: 'signin', pathMatch: 'full', redirectTo: '/account/signin' },
  { path: 'signup', pathMatch: 'full', redirectTo: '/account/signup' },
  { path: 'register', pathMatch: 'full', redirectTo: '/account/signup' },
  { path: 'forgot-password', pathMatch: 'full', redirectTo: '/account/forgot-password' },
  { path: 'forgotpassword', pathMatch: 'full', redirectTo: '/account/forgot-password' },

  // Main Pages
  { path: 'category', loadChildren: () => import('./components/main/container/category/category.module').then(mod => mod.CategoryModule) },
  { path: 'shop', loadChildren: () => import('./components/main/container/shop/shop.module').then(mod => mod.ShopModule) },
  { path: 'product', loadChildren: () => import('./components/main/container/product/product.module').then(mod => mod.ProductModule) },
  { path: 'cart', loadChildren: () => import('./components/main/container/cart/cart.module').then(mod => mod.CartModule) },
  { path: 'checkout', loadChildren: () => import('./components/main/container/checkout/checkout.module').then(mod => mod.CheckoutModule) },
  { path: 'checkout', pathMatch: 'full', redirectTo: '/checkout/shipping' },

  // Store
  { path: 'store', loadChildren: () => import('./components/main/container/store/store.module').then(mod => mod.StoreModule) },

  // Customer
  { path: 'customer', loadChildren: () => import('./components/main/container/customer/customer.module').then(mod => mod.CustomerModule) },

  // Admin
  { path: 'admin', loadChildren: () => import('./components/main/container/admin/admin.module').then(mod => mod.AdminModule) },

  // Page Not Found
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: null
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { ShopService } from 'src/app/services/shop/shop.service';
import * as jquery from 'jquery';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { QuickLookComponent } from 'src/app/utility/quick-look/quick-look.component';
import { CartService } from 'src/app/services/cart/cart.service';
import { WishlistService } from 'src/app/services/customer/wishlist/wishlist.service';

@Component({
  selector: '.app-shop',
  templateUrl: './shop.component.html',
  styleUrls: [
    '../category/category.component.scss',
    './shop.component.scss'
  ]
})
export class ShopComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public ghostLoading: boolean;
  public bsModalRef: BsModalRef;
  public ghostContainer = [];
  public ghostData = [];
  public products = [];
  public allProducts: boolean;
  public shop: any = [];
  public categories: any[];
  private query: string;
  public userType: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transport: TransportorService,
    private shopService: ShopService,
    private modalService: BsModalService,
    private cart: CartService,
    private ngZone: NgZone,
    private wishService: WishlistService
  ) {
    this.ghostLoading = true;
    this.ghostFunction();
    this.categories = [];
    this.allProducts = true;
    this.query = 'all';
  }

  ngOnInit() {
    this.selectActive()

    this.subscriptions.push(
      this.route.queryParams.subscribe((data) => {
        if (data.category != undefined) {
          if (data.category.toLowerCase() != 'all') {
            this.allProducts = false;
            this.query = data.category;
          }
        }
      })
    )

    this.subscriptions.push(
      this.transport.call.subscribe((data: any) => {
        switch (data.type) {
          case 'favorite':
            this.updateProduct(data.msg);
            break;
          case 'already-in-cart':
            this.alreadyAdded(data.msg)
            break;
          case 'user-signal':
              this.routeChanges(data.msg);
              break;
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private routeChanges(msg: any) {
    this.userType = msg;
    if(this.userType == ''){
      this.router.navigate(['/', 'account', 'shop', 'login']);
      return false;
    }

    if (this.userType == 'customer') {
      this.subscriptions.push(
        this.route.url.subscribe((data) => {
          if (data[0] != undefined) {
            this.ghostLoading = true;
            let shop = data[0].path.toLowerCase()
            this.shopService.get(shop).subscribe((data: any) => {
              this.shopInfo(data)
            })
          }
        })
      )
    } else {
      // Get authenticated shop data
      this.shopService.getShop().subscribe((data: any) => {
        this.shopInfo(data)
      })
    }

  }

  private alreadyAdded(product: any) {
    if (!this.allProducts) {
      for (let i = 0; i < this.products.length; i++) {
        if (product.id == this.products[i].id) {
          this.products[i].favorite = product.favorite;
          break;
        }
      }
    } else {
      for (let i = 0; i < this.products.length; i++) {
        let collection = this.products[i].collection;
        for (let k = 0; k < collection.length; k++) {
          if (product.id == collection[k].id) {
            this.products[i].collection[k].favorite = product.favorite;
            break;
          }
        }
      }
    }

  }

  public showDetails(event: any) {
    let _this = event.target.offsetParent,
      _class = 'focus',
      _item = document.querySelectorAll('.item');
    if (_this.classList.contains(_class)) {
      _this.classList.remove(_class)
    } else {
      if (_item.length != 0) {
        for (let i = 0; i < _item.length; i++) {
          if (_item[i].classList.contains(_class)) {
            _item[i].classList.remove(_class)
          }
        }
      }
      _this.classList.add(_class)
    }
  }

  public disableClickEvent(event: any) {
    event.preventDefault();
  }

  public hrefChange(event: any, sub_category: string) {
    event.preventDefault();
    this.changeRoute('category', sub_category, '');
  }

  private selectActive() {
    jquery(() => {
      jquery('.by-category').select2()
      jquery('.custom-select').select2()

      jquery('.by-category').on('select2:select', (e) => {
        var data = e.params.data.element.value,
          target = e.target.name, subcategory = '';
          if(target == 'sub-category'){
            var category: any = document.getElementById('by-category');
            subcategory = data
            data = category.value;
          }
        this.changeRoute(target, data, subcategory);
      });
    })
  }

  private ghostFunction() {
    this.ghostContainer = []
    for (let k = 1; k <= 2; k++) {
      this.ghostContainer.push(k);
    }

    this.ghostData = []
    for (let i = 1; i <= 15; i++) {
      this.ghostData.push(i);
    }
  }

  private changeRoute(type: string, data: string, sub_category: string) {
    this.query = data;
    let route: any, params: any;
    if (this.userType == 'manager') {
      route = ['/', 'store', 'dashboard']
    } else {
      route = ['/', 'shop', this.shop.identity]
    }

    if (type == 'sub-category') {
      params = {
        category: data,
        sub_category: sub_category
      };
    }else{
      params = {
        category: data
      };
    }

    this.ngZone.run(() => {
      this.router.navigate(route, {
        queryParams: params
      })
    });

    if (this.query == 'all') {
      this.allProducts = true;
    } else {
      this.allProducts = false;
    }

    this.ghostLoading = true;
    this.getProducts(this.shop.id)
  }

  private shopInfo(data: any) {
    this.shop = data.shop;
    this.getProducts(this.shop.id)
  }

  private getProducts(shop: number) {
    this.shopService.getProducts(shop, this.query).subscribe((results: any) => {
      this.ghostLoading = false;
      this._products(results);
    })
  }

  private _products(_data: any) {
    this.categories = _data.categories
    this.transport.send({
      msg: _data.nav_categories,
      type: 'nav-categories'
    })

    this.products = []
    for (let i = 0; i < _data.collection.length; i++) {
      this.products.push(_data.collection[i])
    }

    if (!this.allProducts) {
      this.products.forEach((product, index) => {
        this.cart.check(product.id);
      })
    } else {
      this.products.forEach((value, i) => {
        let collection = value.collection;
        collection.forEach((product, index) => {
          this.cart.check(product.id);
        })
      })
    }
  }

  public quickLook(event, data) {
    event.preventDefault();
    let conti = false,
      categoryIndex = null,
      productIndex = null,
      product = null;

    if (this.allProducts) {
      if (data.category != undefined) {
        if (this.products[data.category] != undefined) {
          if (this.products[data.category].collection[data.product] != undefined) {
            conti = true;
            categoryIndex = data.category;
            product = this.products[data.category].collection[data.product]
          }
        }
      }
    } else {
      if (data.product != undefined) {
        if (this.products[data.product] != undefined) {
          conti = true;
          product = this.products[data.product]
        }
      }
    }

    if (!conti) {
      console.log('Product is not available')
      return;
    }

    productIndex = data.product;

    const initialState = {
      categoryIndex: categoryIndex,
      productIndex: productIndex,
      product: product
    };
    this.bsModalRef = this.modalService.show(QuickLookComponent, { initialState, class: 'modal-xxl modal-dialog-centered' });
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  private updateProduct(data: any) {
    if (data.category == undefined) {
      this.products[data.product].favorite = data.favorite
    } else {
      this.products[data.category].collection[data.product].favorite = data.favorite
    }

  }

  /**
   * Add product to favorites
   * @param data may contain "categoryIndex", "productIndex" and "favorite" as a boolean
   */
  public favorite(data: any) {
    let output: any;
    if (data.c != undefined) {
      output = {
        category: data.c,
        product: data.p,
        favorite: !data.f
      }
    } else {
      output = {
        product: data.p,
        favorite: !data.f
      }
    }

    this.wishService.store(!data.f, data.p).subscribe((data: any) => {
      console.log(data)
    });
    this.updateProduct(output)
  }

  private dbActions(data: any) {
    let product: any;
    if (data.category == undefined) {
      product = this.products[data.product];
    } else {
      product = this.products[data.category].collection[data.product];
    }

    let store = this.cart.store({
      id: product.id,
      name: product.name,
      price: product.price,
      pictures: product.pictures,
      owner: product.owner,
      quantity: 0,
      specialInfo: '',
      favorite: data.favorite
    }, 'favorite');
  }

}

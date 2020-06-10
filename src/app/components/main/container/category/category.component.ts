import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { HomeService } from 'src/app/services/home/home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QuickLookComponent } from 'src/app/utility/quick-look/quick-look.component';
import * as jquery from 'jquery';
import { CartService } from 'src/app/services/cart/cart.service';
import { WishlistService } from 'src/app/services/customer/wishlist/wishlist.service';

@Component({
  selector: '.category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public bsModalRef: BsModalRef;
  public ghostLoading: boolean;
  public ghostContainer = [];
  public ghostData = [];
  public contentData = [];
  public subCategories = [];
  public subCategory: boolean;
  private routeData: any;

  constructor(
    private homeService: HomeService,
    private route: ActivatedRoute,
    private router: Router,
    private transport: TransportorService,
    private modalService: BsModalService,
    private cart: CartService,
    private wishService: WishlistService
  ) {
    this.ghostLoading = true;
    this.subCategories = [];
    this.ghostFunction();
  }

  ngOnInit() {

    this.subscriptions.push(
      this.route.url.subscribe((data) => {
        let conti = false,
          category = null,
          sub_category = null;
        if (data.length >= 1) {
          conti = true;
          category = data[0].path
        }

        if (data.length == 3) {
          conti = true;
          this.subCategory = true;
          sub_category = data[2].path
        }

        if (this.subCategory) {
          this.selectActive()
        }

        if (conti) {
          this.routeData = data;
          this.ghostLoading = true;
          this.subscriptions.push(
            this.homeService.get(category, sub_category).subscribe((results: any) => {
              this._contentData(results);
            })
          )
        } else {
          this.router.navigate(['/', 'index'], {
            fragment: 'categories'
          })
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
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private alreadyAdded(product: any) {
    if (this.subCategory) {
      for (let i = 0; i < this.contentData.length; i++) {
        if (product.id == this.contentData[i].id) {
          this.contentData[i].favorite = product.favorite;
          break;
        }
      }
    } else {
      for (let i = 0; i < this.contentData.length; i++) {
        let collection = this.contentData[i].collection;
        for (let k = 0; k < collection.length; k++) {
          if (product.id == collection[k].id) {
            this.contentData[i].collection[k].favorite = product.favorite;
            break;
          }
        }
      }
    }

  }

  public disableClickEvent(event: any) {
    event.preventDefault();
  }

  private selectActive() {
    jquery(() => {
      jquery('#by-category').select2()
      jquery('.custom-select').select2()

      jquery('#by-category').on('select2:select', (e) => {
        var data = e.params.data.element.value;
        this.changeRoute(data)
      });
    })
  }

  private changeRoute(data) {
    this.router.navigate(['/', 'category', this.routeData[0].path, 'products', data]);
  }

  private ghostFunction() {
    this.ghostContainer = []
    for (let k = 1; k <= 2; k++) {
      this.ghostContainer.push(k);
    }

    this.ghostData = [];
    for (let i = 1; i <= 10; i++) {
      this.ghostData.push(i);
    }
  }

  private _contentData(_data: any) {
    if (_data == null) {
      console.log('Empty results')
      return false;
    }

    this.subCategories = _data.sub_categories

    this.transport.send({
      msg: _data.nav_categories,
      type: 'nav-categories'
    })
    this.contentData = []
    for (let i = 0; i < _data.collection.length; i++) {
      this.contentData.push(_data.collection[i])
    }

    if (this.subCategory) {
      this.contentData.forEach((product, index) => {
        this.cart.check(product.id);
      })
    } else {
      this.contentData.forEach((value, i) => {
        let collection = value.collection;
        collection.forEach((product, index) => {
          this.cart.check(product.id);
        })
      })
    }

    if (_data.collection.length != 0) {
      this.ghostLoading = false;
    }
  }

  public quickLook(event, data) {
    event.preventDefault();
    let conti = false,
      categoryIndex = null,
      productIndex = null,
      product = null;

    if (!this.subCategory) {
      if (data.category != undefined) {
        if (this.contentData[data.category] != undefined) {
          if (this.contentData[data.category].collection[data.product] != undefined) {
            conti = true;
            categoryIndex = data.category;
            product = this.contentData[data.category].collection[data.product]
          }
        }
      }
    } else {
      if (data.product != undefined) {
        if (this.contentData[data.product] != undefined) {
          conti = true;
          product = this.contentData[data.product]
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
    let update = (fav: boolean) => {
      if (data.category == undefined) {
        this.contentData[data.product].favorite = fav
      } else {
        this.contentData[data.category].collection[data.product].favorite = fav
      }
    }

    let product = 0;
    if (data.category == undefined) {
      product = this.contentData[data.product].id
    } else {
      product = this.contentData[data.category].collection[data.product].id
    }

    update(data.favorite)

    this.wishService.store(data.favorite, product).subscribe((_data: any) => {
      if (!_data.success) {
        update(!data.favorite)
      }
    }, (er: any) => {
      update(!data.favorite)
    });
  }

  /**
   * Add product to favorites
   * @param data may contain "categoryIndex", "productIndex" and "favorite" as a boolean
   */
  public favorite(data: any) {
    let output;

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

    this.updateProduct(output)
  }

  private dbActions(data: any) {
    let product: any;
    if (data.category == undefined) {
      product = this.contentData[data.product];
    } else {
      product = this.contentData[data.category].collection[data.product];
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product/product.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { WishlistService } from 'src/app/services/customer/wishlist/wishlist.service';

@Component({
  selector: '.product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public ghostLoading: boolean;
  public product: any = [];
  public breadcrumb: any[];
  public updated: boolean;
  public updateCart: boolean;
  private actionType: string;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private transport: TransportorService,
    private wishService: WishlistService
  ) {
    this.ghostLoading = true;
    this.breadcrumb = [];
    this.product = [];
    this.updated = false;
    this.updateCart = false;
    this.actionType = 'store'
  }

  ngOnInit() {

    this.subscriptions.push(
      this.route.url.subscribe((data) => {
        if (data.length >= 2) {
          this.ghostLoading = true;
          let product = data[1].path;
          if (isNaN(parseInt(product))) {
            console.log('Provided URL is not found')
            return false;
          }

          this.subscriptions.push(
            this.productService.get(product).subscribe((data: any) => {
              this.ghostLoading = false;
              this.contentData(data)
            })
          )
        }
      })
    )

    this.subscriptions.push(
      this.transport.call.subscribe((data) => {
        if (data.type == 'already-in-cart') {
          let info = data.msg;
          if (info.quantity == 0 && info.specialInfo == '') {
            return false;
          }

          this.updated = true;
          this.updateCart = true;
          this.actionType = 'update';
          let quantity: any = document.getElementById('quantity'),
            instructions: any = document.getElementById('instructions');
          instructions.value = info.specialInfo;
          quantity.value = info.quantity;
          this.product.favorite = info.favorite
        }
      })
    )

  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private contentData(_data: any) {
    this.breadcrumb = _data.navigation
    this.product = _data.product
    this.cart.check(this.product.id);
  }

  /**
   * Increasing quantity
   * @param elementRef reference of input element
   */
  public quantityUp(elementRef: HTMLInputElement) {
    elementRef.value = '' + (parseInt(elementRef.value) + 1);
    this.contentChange();
  }

  /**
   * Reducing quantity
   * @param elementRef reference of input element
   */
  public quantityDown(elementRef: HTMLInputElement) {
    if (parseInt(elementRef.value) <= 1) return false;

    elementRef.value = '' + (parseInt(elementRef.value) - 1);
    this.contentChange();
  }

  /**
   * Add product to favorites
   */
  public favorite() {
    let fav = !this.product.favorite;
    this.product.favorite = fav;
    this.wishService.store(fav, this.product.id).subscribe((data: any) => {
      if (!data.success) {
        this.product.favorite = !this.product.favorite;
      }
    }, (er: any) => {
      this.product.favorite = !this.product.favorite;
    });
  }

  public addToCart(event: any) {
    this.dbActions()
  }

  private dbActions() {
    let quantity: any = document.getElementById('quantity'),
      instructions: any = document.getElementById('instructions');
    if (isNaN(parseInt(quantity.value))) {
      console.log('Incorrect quantity')
      return false;
    }

    let actionType = this.actionType;
    let inputQuantity = parseInt(quantity.value),
      inputInstruct = instructions.value.trim()
    if (actionType == 'favorite') {
      inputQuantity = 0;
      inputInstruct = '';
    }

    let store = this.cart.store({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      pictures: this.product.pictures,
      owner: this.product.owner,
      quantity: inputQuantity,
      specialInfo: inputInstruct,
      favorite: this.product.favorite
    }, actionType);

    if (store) {
      quantity.value = '1'
      instructions.value = ''
      this.updateCart = true;
      this.updated = !this.updated;
    }
  }

  public contentChange() {
    if (this.updateCart) {
      this.updated = !this.updated;
      this.updateCart = false;
    }
  }

}

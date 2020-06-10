import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TransportorService } from '../transportor/transportor.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { Subscription } from 'rxjs';
import { WishlistService } from 'src/app/services/customer/wishlist/wishlist.service';

@Component({
  selector: '.quick-look',
  templateUrl: './quick-look.component.html',
  styleUrls: ['./quick-look.component.scss']
})
export class QuickLookComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  closeBtnName: string;
  product: any;
  categoryIndex: number;
  productIndex: number;
  public compare: boolean;
  public compareChecking: boolean
  public updated: boolean;
  public updateCart: boolean;
  private actionType: string;

  constructor(
    public bsModalRef: BsModalRef,
    private transport: TransportorService,
    private cart: CartService,
    private wishService: WishlistService
  ) {
    this.updated = false;
    this.updateCart = false;
    this.actionType = 'store'
  }

  ngOnInit() {
    this.quantityWatch()
    this.compare = false;
    this.compareChecking = false

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
          instructions.value = (info.specialInfo == undefined) ? '' : info.specialInfo;
          quantity.value = info.quantity;
          this.product.favorite = info.favorite
        }
      })
    )

    this.cart.check(this.product.id);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private quantityWatch() {
    let elem = document.getElementById('quantity');
    elem.addEventListener('change', (event: any) => {
      let elem = event.target,
        val = parseInt(event.target.value);
      if (isNaN(val) || val <= 0) {
        elem.value = '1';
      }

    })
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
   * @param categoryIndex category index the product belongs to
   * @param productIndex product index
   */
  public favorite(categoryIndex: number, productIndex: number) {
    let favorite = true;
    if (this.product.favorite) {
      favorite = false;
    }
    this.product.favorite = favorite
    this.wishService.store(favorite, this.product.id).subscribe((data: any) => {
      if (!data.success) {
        this.product.favorite = !this.product.favorite;
      } else {
        this.transport.send({
          msg: {
            category: categoryIndex,
            product: productIndex,
            favorite: favorite
          },
          type: 'favorite'
        })
      }
    }, (er: any) => {
      this.product.favorite = !this.product.favorite;
    });

  }

  /**
   * Add to compare list
   * @param categoryIndex category index the product belongs to
   * @param productIndex product index
   * @param compare boolean
   */
  public toCompare(categoryIndex: number, productIndex: number, compare: boolean) {
    this.compare = !compare;
    console.log(categoryIndex, productIndex, compare)
  }

  public addToCart(event: any) {
    this.dbActions()
  }

  private dbActions(action?: string) {
    let quantity: any = document.getElementById('quantity'),
      instructions: any = document.getElementById('instructions');
    if (isNaN(parseInt(quantity.value))) {
      console.log('Incorrect quantity')
      return false;
    }

    let actionType: string;
    if (action == undefined) {
      actionType = this.actionType;
    } else {
      actionType = action;
    }

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

    if (store && action == undefined) {
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

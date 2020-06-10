import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart/cart.service';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { Router } from '@angular/router';

@Component({
  selector: '.app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public cartLoading: boolean;
  public cartData: any[];
  public orderTotal: number;
  public subTotal: number;
  public shippingCost: number

  constructor(
    private cart: CartService,
    private transport: TransportorService,
    private route: Router
  ) {
    this.cartLoading = true;
    this.cartData = [];
    this.orderTotal = 0;
    this.subTotal = 0;
    this.shippingCost = 0;
  }

  ngOnInit() {

    this.subscriptions.push(
      this.transport.call.subscribe((data) => {
        switch (data.type) {
          case 'cart-data':
            this.updateCart(data.msg.data)
            break;
        }
      })
    )

    this.cart.get('get-cart');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private updateCart(data: any, type?: string) {
    let _tempData = data;
    this.orderTotal = 0
    _tempData.forEach((value, index) => {
      this.orderTotal += (value.price * value.quantity);
    })

    this.shippingCost = 10;
    this.subTotal = this.orderTotal + this.shippingCost;

    if (type == undefined) {
      this.cartData = data;
      setTimeout(() => {
        this.cartLoading = false
      }, 1000)
    }
  }

  public removeItem(index: number) {
    let _delete = this.cart.delete(this.cartData[index].id)
    if (_delete) {
      this.cartData.splice(index, 1)
      this.updateCart(this.cartData)
    }
  }

  /**
   * Increasing quantity
   * @param elementRef reference of input element
   */
  public quantityUp(elementRef: HTMLInputElement, index: number) {
    let _q = (parseInt(elementRef.value) + 1)
    elementRef.value = '' + _q;
    this.contentChange(index, _q);
  }

  /**
   * Reducing quantity
   * @param elementRef reference of input element
   */
  public quantityDown(elementRef: HTMLInputElement, index: number) {
    if (parseInt(elementRef.value) <= 1) return false;

    let _q = (parseInt(elementRef.value) - 1)
    elementRef.value = '' + _q;
    this.contentChange(index, _q);
  }

  public change(elementRef: HTMLInputElement, index: number) {
    if (parseInt(elementRef.value) <= 1) return false;
    this.contentChange(index, parseInt(elementRef.value));
  }

  private contentChange(index: number, quantity: number) {
    this.cartData[index].quantity = quantity;
    let product = this.cartData[index]

    let store = this.cart.store({
      id: product.id,
      name: product.name,
      price: product.price,
      pictures: product.pictures,
      owner: product.owner,
      quantity: quantity,
      specialInfo: product.specialInfo,
      favorite: product.favorite
    }, 'update');

    if (store) {
      this.updateCart(this.cartData)
    }

  }

  public clearCart() {
    this.cart.clear();
    this.cartData = [];
    this.orderTotal = 0;
    this.subTotal = 0;
  }

  public navigateToCheckOut(){
    this.route.navigate(['checkout', 'shipping'])
  }

}

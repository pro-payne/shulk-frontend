import { Component, OnInit } from '@angular/core';
import { WishlistService } from 'src/app/services/customer/wishlist/wishlist.service';
import { CartService } from 'src/app/services/cart/cart.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['../../store/manage-products/manage-products.component.scss', './wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  public loadingWishlist: boolean;
  public wishlist: any[];
  public disableAll: boolean;

  constructor(
    private wishService: WishlistService,
    private cart: CartService
  ) {
    this.loadingWishlist = true;
    this.wishlist = [];
    this.disableAll = true;
  }

  ngOnInit() {
    this.wishService.get().subscribe((data: any) => {
      this.wishlist = data.data
      this.loadingWishlist = false
    })
  }

  public selectAll(target: any) {
    let checkbox: any = document.getElementsByClassName('checkbox-input'),
      checked = false;

    if (target.checked) {
      checked = true;
      this.disableAll = false
    } else {
      this.disableAll = true
    }

    for (let i = 0; i < checkbox.length; i++) {
      checkbox[i].checked = checked;
    }
  }

  public checked(target: any) {
    let checkbox: any = document.getElementsByClassName('checkbox-input'),
      count = 0;
    this.disableAll = true
    for (let i = 0; i < checkbox.length; i++) {
      if (checkbox[i].checked) {
        count++;
        this.disableAll = false
      }
    }

    let select_all: any = document.getElementById('select-all')
    if (count == checkbox.length) {
      select_all.checked = true
    } else {
      select_all.checked = false
    }
  }

  public addToCart() {
    let checkboxes: any = document.getElementsByClassName('checkbox-input'),
      Ids = [];
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        Ids.push(this.wishlist[parseInt(checkboxes[i].value)].id)
      }
    }

    this.wishService.add_to_cart(JSON.stringify(Ids)).subscribe((data: any) => {
      if (data.moved.length != 0) {
        for (let i = 0; i < data.moved.length; i++) {
          let product = data.moved[i];
          this.cart.store({
            id: product.id,
            name: product.name,
            price: product.price,
            pictures: product.pictures,
            owner: product.owner,
            quantity: 1,
            specialInfo: '',
            favorite: false
          }, 'store');

          for (let x = 0; x < this.wishlist.length; x++) {
            if (this.wishlist[x].id == product.id) {
              this.wishlist.splice(x, 1)
            }
          }
        }

      }
    })

  }

  public removeItems() {
    let checkboxes: any = document.getElementsByClassName('checkbox-input'),
      Ids = [];
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        Ids.push(this.wishlist[parseInt(checkboxes[i].value)].id)
      }
    }

    this.wishService.removeitems(JSON.stringify(Ids)).subscribe((data: any) => {
      if (data.removed.length != 0) {
        for (let i = 0; i < data.removed.length; i++) {
          let product = data.removed[i];
          for (let x = 0; x < this.wishlist.length; x++) {
            if (this.wishlist[x].id == product.id) {
              this.wishlist.splice(x, 1)
            }
          }
        }
      }
    })

  }

}

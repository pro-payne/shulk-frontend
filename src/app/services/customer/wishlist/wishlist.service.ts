import { Injectable } from '@angular/core';
import { TokenService } from '../../token/token.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private user: any
  constructor(
    private token: TokenService,
    private http: HttpClient,
    private config: ConfigService
  ) {
    let user = this.token.getUser('user_id');
    if (user == null) {
      console.log("You need to login to save!!")
      this.user = 0
    } else {
      this.user = user
    }
  }

  get() {
    return this.http.get(ConfigService.Url + 'customer/' + this.user + '/wishlist', {
      headers: this.config.headers(true)
    })
  }

  store(favorite: boolean, id: number) {
    if (favorite) {
      return this.http.post(ConfigService.Url + 'customer/' + this.user + '/wishlist', {
        product: id
      }, {
        headers: this.config.headers(true)
      })
    } else {
      return this.http.delete(ConfigService.Url + 'customer/' + this.user + '/wishlist/' + id, {
        headers: this.config.headers(true)
      })
    }

  }

  add_to_cart(items: string){
    return this.http.post(ConfigService.Url + 'customer/' + this.user + '/wishlist/move_to_cart', {
      items: items
    }, {
      headers: this.config.headers(true)
    })
  }

  removeitems(items: string){
    return this.http.post(ConfigService.Url + 'customer/' + this.user + '/wishlist/remove_items', {
      items: items
    }, {
      headers: this.config.headers(true)
    })
  }

}

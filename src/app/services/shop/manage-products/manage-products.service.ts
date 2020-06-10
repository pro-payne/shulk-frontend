import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';
import { TokenService } from '../../token/token.service';

@Injectable({
  providedIn: 'root'
})
export class ManageProductsService {

  private shop: number
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private token: TokenService
  ) {
    this.shop = this.token.getUser().shop.id;
  }

  get() {
    return this.http.get(ConfigService.Url + 'shops/' + this.shop + '/categories', {
      headers: this.config.headers(false)
    })
  }

  addProduct(data: any) {
    let user = this.token.getUser('user_id');
    if (user == null) {
      console.log("You need to login to save!!")
      return;
    }
    return this.http.post(ConfigService.Url + 'manager/' + user + '/shops/' + this.shop + '/products', data, {
      headers: this.config.headers(true)
    })
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) { }

  public get(productId: string){
    return this.http.get(ConfigService.Url + 'products', {
      headers: this.config.headers(false),
      params: {
        id: productId
      }
    });
  }
}

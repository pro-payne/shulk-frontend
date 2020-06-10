import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) { }

  public get(category?: string, subCategory?: string) {
    let params: any, url = 'categories';
    if (category != undefined) {
      params = {
        category: category
      }
    }

    if (subCategory != undefined) {
      url = 'sub_categories'
      params = {
        category: category,
        sub_category: subCategory
      }
    }

    return this.http.get(ConfigService.Url + url, {
      headers: this.config.headers(false),
      params: params
    });
  }
}

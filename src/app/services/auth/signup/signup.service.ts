import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) { }

  post(data: any, type: string, userType: string) {
    return this.http.post(ConfigService.Url + 'auth/' + userType + '/' + type, data, {
      headers: this.config.headers(false)
    })
  }

}

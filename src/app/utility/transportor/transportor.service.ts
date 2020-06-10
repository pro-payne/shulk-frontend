import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from 'src/app/interface/message';

@Injectable({
  providedIn: 'root'
})

export class TransportorService {

  private callBahavior = new Subject<Message>();
  public call = this.callBahavior.asObservable();

  constructor() { }

  send(data: Message){
    this.callBahavior.next(data)
  }

}

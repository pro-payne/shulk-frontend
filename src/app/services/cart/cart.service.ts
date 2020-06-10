import { Injectable } from '@angular/core';
import { Cart } from 'src/app/interface/cart';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';
import { TokenService } from '../token/token.service';

const DB_NAME = 'shrulk';
const DB_STORE_NAME = 'cart';

@Injectable({
  providedIn: 'root'
})

export class CartService {

  private db: any;

  constructor(
    private transport: TransportorService,
    private http: HttpClient,
    private config: ConfigService,
    private token: TokenService
  ) { }

  private supported() {
    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
      return false;
    }

    return true;
  }

  private openDb(data: any, type: string, backup?: boolean) {
    let request = window.indexedDB.open(DB_NAME);
    request.onerror = (event: any) => {
      // Do something with request.errorCode!
      console.error("Database error: " + event.target.errorCode)
    };
    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      switch (type) {
        case 'store':
          this.addProduct(data, backup);
          break;
        case 'update':
        case 'favorite':
          this.updateProduct(type, data)
          break;
        case 'check':
          this.checkProduct(data);
          break;
        case 'count':
        case 'get-cart':
          this.getCart(type);
          break;
        case 'delete':
          this.removeProduct(data);
          break;
      }
    };

    request.onupgradeneeded = (event: any) => {
      // Save the IDBDatabase interface
      let db = event.target.result;

      // Create an objectStore for this database
      let objectStore = db.createObjectStore(DB_STORE_NAME, { keyPath: "id" });

      objectStore.createIndex("id", "id", { unique: true });
    };
  }

  /**
   * @param {string} store_name
   * @param {string} mode either "readonly" or "readwrite"
   */
  private getObjectStore(store_name: string, mode: string) {
    let tx = this.db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  }

  public clear() {
    let clear = this.getObjectStore(DB_STORE_NAME, 'readwrite');
    let req = clear.clear();
    req.onsuccess = (evt) => {
      this.httpHandle('delete', null);
      this.updateCount()
    };
    req.onerror = function (evt) {
      console.error("clearObjectStore:", evt.target.errorCode);
    };
  }

  private removeProduct(id: number) {
    let remove = this.getObjectStore(DB_STORE_NAME, 'readwrite');
    let req = remove.delete(id);
    req.onsuccess = (evt) => {
      this.httpHandle('delete', id)
      this.updateCount()
    };

    req.onerror = function (evt) {
      console.error("clearObjectStore:", evt.target.errorCode);
    };
  }

  private addProduct(data: Cart, backup: any) {
    let store = this.getObjectStore(DB_STORE_NAME, 'readwrite');
    let req: any;
    try {
      req = store.put(data);
      req.onsuccess = () => {
        this.updateCount()
      }

      if(backup != undefined && backup == true) return;

      this.httpHandle('post', data)

    } catch (e) {
      if (e.name == 'DataCloneError')
        console.error("This engine doesn't know how to clone a Blob, " +
          "use Firefox");
      throw e;
    }
    req.onerror = function () {
      console.error("addCart error", this.error);
    };
  }

  // Http Post

  private httpHandle(type: string, data: any) {
    let user = this.token.getUser('user_id');
    if (user != null) {
      user = parseInt(user);
      switch (type) {
        case 'post':
          this.httpPost(user, data).subscribe((data: any) => {
            if (data.success) {

            }
          })
          break;
        case 'delete':
          this.httpDelete(user, data).subscribe((data: any) => {
            if (data.success) {

            }
          })
          break;
      }
    } else {
      console.log("You need to login to save!!")
    }
  }

  private httpPost(user: number, data: Cart) {
    return this.http.post(
      ConfigService.Url + 'customer/' + user + '/cart',
      {
        id: data.id,
        quantity: data.quantity,
        specialInfo: data.specialInfo
      },
      {
        headers: this.config.headers(true)
      })
  }

  private httpDelete(user: number, id: number) {
    let cart = '/cart';
    if (id != null) {
      cart = '/cart/' + id;
    }
    return this.http.delete(
      ConfigService.Url + 'customer/' + user + cart, {
      headers: this.config.headers(true)
    })
  }

  private updateProduct(type: string, data: Cart) {
    let store = this.getObjectStore(DB_STORE_NAME, 'readwrite');
    let req: any;
    try {
      req = store.get(data.id);
      req.onsuccess = (evt) => {
        let value = evt.target.result, productUpdate: any, input: any;
        if (value != undefined && type == 'favorite') {
          value.favorite = data.favorite
          productUpdate = store.put(value)
        } else {
          productUpdate = store.put(data)
        }
        productUpdate.onsuccess = (data) => {
          this.updateCount()
        }
        this.httpHandle('post', data);
      };
    } catch (e) {
      if (e.name == 'DataCloneError')
        console.error("This engine doesn't know how to clone a Blob, " +
          "use Firefox");
      throw e;
    }
    req.onerror = function () {
      console.error("addCart error", this.error);
    };
  }

  private checkProduct(product: number) {
    let read = this.getObjectStore(DB_STORE_NAME, 'readonly'),
      req: any;
    try {
      req = read.get(product);
      req.onsuccess = (evt) => {
        let value = evt.target.result;
        if (value != undefined) {
          this.transport.send({
            msg: value,
            type: 'already-in-cart'
          })
        }else{
          this.transport.send({
            msg: product,
            type: 'not-in-cart'
          })
        }
      };
    } catch (e) {
      if (e.name == 'DataCloneError')
        console.error("This engine doesn't know how to clone a Blob, " +
          "use Firefox");
      throw e;
    }

  }

  /**
   * Count items added to cart
   */
  private getCart(type: string) {
    let read = this.getObjectStore(DB_STORE_NAME, 'readonly'),
      req: any;
    try {
      req = read.getAll();
      req.onsuccess = (evt) => {
        let value = evt.target.result;

        if (value != undefined) {
          let count = 0, data = [];
          value.forEach((_value, _index) => {
            if (_value.quantity > 0) {
              if (type == 'count') {
                count++;
              } else {
                data.push(_value)
              }
            }
          });

          if (type == 'get-cart') {
            type = 'cart-data'
          }

          this.transport.send({
            msg: {
              count: count,
              data: data
            },
            type: type
          })
        }
      };
    } catch (e) {
      if (e.name == 'DataCloneError')
        console.error("This engine doesn't know how to clone a Blob, " +
          "use Firefox");
      throw e;
    }
  }

  private updateCount() {
    this.transport.send({
      msg: 0,
      type: 'count-update'
    })
  }

  store(data: Cart, type: string, backup = false) {

    if (!this.supported()) {
      return false;
    }

    this.openDb(data, type, backup);

    return true
  }

  delete(data: any) {
    if (!this.supported()) {
      return false;
    }

    this.openDb(data, 'delete');
    return true;
  }

  check(id: number) {
    if (!this.supported()) {
      return false;
    }

    this.openDb(id, 'check');

    return true
  }

  get(type: string) {
    if (!this.supported()) {
      return false;
    }

    this.openDb([], type);
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from 'src/app/services/customer/order/order.service';
import { Subscription } from 'rxjs';
import { NotifyService } from 'src/app/services/notify/notify.service';
import { Router } from '@angular/router';

@Component({
  selector: '.app-orders',
  templateUrl: './orders.component.html',
  styleUrls: [
    '../../store/manage-products/manage-products.component.scss',
    './orders.component.scss'
  ]
})
export class OrdersComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public loadingOrders: boolean;
  public orders: any[];
  cancelingOrder: boolean;
  disablePayNow: boolean;
  disableAll: boolean;

  constructor(
    private orderService: OrderService,
    private notify: NotifyService,
    private route: Router
  ) {
    this.loadingOrders = true;
    this.disableAll = false;
    this.orders = []
  }

  ngOnInit() {
    this.getOrders();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public orderDetails(event: any, id: any) {
    event.preventDefault()
    if (!this.disableAll) {
      this.route.navigate(['/', 'customer', 'orders', id])
    }
  }

  private getOrders() {
    this.orderService.get().subscribe((data: any) => {
      data = data.orders;
      if (data.length != 0) {
        this.orders = data
      }
      this.loadingOrders = false
    })
  }

  public reOrder(event: any, id: any) {
    event.preventDefault();
    this.findElem(event.target)
    this.orderRequest(id, 're-order')
  }

  public cancelOrder(event: any, id: any) {
    event.preventDefault();
    this.findElem(event.target)
    this.orderRequest(id, 'cancel')
  }

  private findElem(target: any) {
    let parentNode: any = target.parentNode.parentNode.parentNode,
      btn = parentNode.querySelector('.btn'),
      option = parentNode.querySelector('.btn .option'),
      image = parentNode.querySelector('.btn .image')
    btn.classList.remove('btn-outline-secondary')
    btn.classList.add('btn-secondary')
    option.classList.add('d-none')
    image.classList.remove('d-none')
  }

  private orderRequest(id: any, type: string) {
    this.disableAll = true;

    this.orderService.editOrder(id, type).subscribe((data: any) => {
      if (data.success) {
        this.loadingOrders = true
        this.getOrders();
      } else {
        this.notify.showNotification('error', data.message)
      }
      this.disableAll = false;
    }, (error: any) => {
      this.notify.showNotification('error', 'Something went wrong, please try again')
      this.disableAll = false;
    })
  }

}

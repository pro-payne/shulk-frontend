import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/customer/order/order.service';
import { NotifyService } from 'src/app/services/notify/notify.service';

@Component({
  selector: '.app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: [
    '../../../store/manage-products/manage-products.component.scss',
    '../orders.component.scss',
    './order-details.component.scss'
  ]
})
export class OrderDetailsComponent implements OnInit {

  public loadingOrder: boolean;
  public orderDetails: any;
  public disablePayNow: boolean;
  public cancelingOrder: boolean;
  public orderState: string;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private notify: NotifyService
  ) {
    this.loadingOrder = true
    this.orderDetails = null;
    this.disablePayNow = false;
    this.cancelingOrder = true;
    this.orderState = ''
  }

  ngOnInit() {

    this.route.params.subscribe((data) => {
      if (data.order_number != undefined) {
        this.orderService.orderDetails(data.order_number).subscribe((data: any) => {
          if (data.success) {
            this.orderDetails = data.order
            switch (this.orderDetails.status) {
              case 'pending':
              case 'processing':
                this.orderState = 'cancel';
                break;
              default:
                this.orderState = 're-order';
                break;
            }
            this.loadingOrder = false;
          }
        })
      } else {
        this.loadingOrder = false;
      }
    })
  }

  private orderRequest(id: any, type: string) {
    this.cancelingOrder = false;
    this.disablePayNow = true;
    let state = '', status = '';
    switch (type) {
      case 'cancel':
        state = 're-order'
        status = 'canceled'
        break;
      case 're-order':
        state = 'cancel'
        status = 'pending'
        break;

    }
    this.orderService.editOrder(id, type).subscribe((data: any) => {
      if (data.success) {
        this.orderState = state;
        this.orderDetails.status = status
      } else {
        this.notify.showNotification('error', data.message)
      }
      this.disablePayNow = false;
      this.cancelingOrder = true;
    }, (error: any) => {
      this.notify.showNotification('error', 'Something went wrong, please try again')
      this.disablePayNow = false;
      this.cancelingOrder = true;
    })
  }

  public cancelOrder(id: any) {
    this.orderRequest(id, 'cancel');
  }

  public reOrder(id: any) {
    this.orderRequest(id, 're-order');
  }

}

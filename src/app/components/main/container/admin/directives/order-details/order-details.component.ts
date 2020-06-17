import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AdminOrdersService } from 'src/app/services/admin/admin-orders/admin-orders.service';
import { NotifyService } from 'src/app/services/notify/notify.service';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public disableNow: boolean;
  public orderDetails: any;
  public orderState: string;

  constructor(
    public bsModalRef: BsModalRef,
    private orderService: AdminOrdersService,
    private notify: NotifyService,
    private transport: TransportorService
  ) {
    this.disableNow = false;
    this.orderState = ''
   }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public changeStatus(event: any, element: any, status: string){
    event.preventDefault();
    element.innerText = status
    this.disableNow = true
    this.orderService.changeStatus(this.orderDetails.id, status).subscribe((data: any) => {
      if(data.success){
        this.orderDetails.status = status
        this.transport.send({
          type: 'order-status',
          msg: {
            index: this.orderDetails.index,
            status: status
          }
        })
        this.bsModalRef.hide()
      }else{
        this.notify.showNotification('error', data.message);
      }

      this.disableNow = false
    })
  }

}

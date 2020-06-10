import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as jquery from 'jquery';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderDetailsComponent } from '../directives/order-details/order-details.component';
import { AdminOrdersService } from 'src/app/services/admin/admin-orders/admin-orders.service';
import { Subscription } from 'rxjs';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';

const states: any = {
  status: 'pending',
  sort: 'desc'
}

@Component({
  selector: '.app-manage-orders',
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.scss']
})
export class ManageOrdersComponent implements OnInit, OnDestroy {

  public bsModalRef: BsModalRef;
  private subscriptions: Subscription[] = [];
  public loadingOrders: boolean;
  public orders: any[] = [];
  public statuses: any[];
  public selectedStatus: string
  public sort: string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private orderService: AdminOrdersService,
    private ngZone: NgZone,
    private transport: TransportorService
  ) {
    this.loadingOrders = true
    this.sort = 'desc';
    this.selectedStatus = 'pending'

    this.statuses = [
      { value: 'Pending', selected: true, count: 0 },
      { value: 'Processing', selected: false, count: 0 },
      { value: 'Canceled', selected: false, count: 0 },
      { value: 'Completed', selected: false, count: 0 },
    ];
  }

  ngOnInit() {
    this.selectActive()

    this.subscriptions.push(
      this.route.queryParamMap.subscribe((data: any) => {
        let params = data.params
        if (params.sort != undefined) {
          states.sort = params.sort
          this.sort = params.sort
        }
        if (params.status != undefined) {
          states.status = params.status
          for (let i = 0; i < this.statuses.length; i++) {
            if (this.statuses[i].value.toLowerCase() == params.status.toLowerCase()) {
              this.statuses[i].selected = true;
              this.selectedStatus = this.statuses[i].value.toLowerCase()
            } else {
              this.statuses[i].selected = false
            }
          }
        }

        this.getOrders();
      })
    )

    this.subscriptions.push(
      this.transport.call.subscribe((data: any) => {
        if (data.type == 'order-status') {
          if (this.selectedStatus != data.msg.status.toLowerCase()) {
            this.orders.splice(data.msg.index, 1)
          }
          for (let i = 0; i < this.statuses.length; i++) {
            if (this.statuses[i].value.toLowerCase() == this.selectedStatus) {
              this.statuses[i].count--;
            }
          }
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }

  private getOrders() {
    this.loadingOrders = true
    this.orderService.get(states).subscribe((data: any) => {
      this.orders = data.orders
      let stats = data.stats;

      for (let i = 0; i < this.statuses.length; i++) {
        if (stats[this.statuses[i].value.toLowerCase()] != undefined) {
          this.statuses[i].count = stats[this.statuses[i].value.toLowerCase()];
        }
      }
      jquery('.custom-select').select2()

      this.loadingOrders = false
    }, (e: any) => {
      this.loadingOrders = false
    })
  }

  private selectActive() {
    jquery(() => {
      jquery('.custom-select').select2()

      jquery('#by-status').on('select2:select', (e) => {
        var data = e.params.data.element.value;
        data = (data.trim() == '') ? 'pending' : data;
        states.status = data
        this.changeRoute()
      });

      jquery('#by-order').on('select2:select', (e) => {
        var data = e.params.data.element.value;
        data = (data.trim() == '') ? 'desc' : data;
        states.sort = data
        this.changeRoute()
      });
    })
  }

  private changeRoute() {

    this.ngZone.run(() => {
      this.router.navigate(['/', 'admin', 'manage-orders'], {
        queryParams: {
          status: states.status,
          sort: states.sort
        }
      })
    });

  }

  public orderDetails(event: any, index: any) {
    event.preventDefault();
    let order = this.orders[index];
    let orderDetails = {
      index: index,
      id: order.id,
      ordered_at: order.ordered_at,
      status: order.status,
      customer: order.ordered_by,
      delivery_address: {
        receiver: order.ordered_by.name,
        street: order.delivery_address.street,
        city: order.delivery_address.city,
        zip: order.delivery_address.zip
      },
      summary: {
        items: order.summary.items,
        delivery_cost: order.summary.delivery_cost,
        total: order.summary.total
      }
    }

    const initialState = {
      orderDetails: orderDetails,
      orderState: 'cancel'
    };
    this.bsModalRef = this.modalService.show(OrderDetailsComponent, { initialState, class: 'modal-lg modal-dialog-centered' });
    this.bsModalRef.content.closeBtnName = 'Close';
  }

}

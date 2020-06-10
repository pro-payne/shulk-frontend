import { Component, OnInit } from '@angular/core';
import * as jquery from 'jquery';
import { ManageProductsService } from 'src/app/services/shop/manage-products/manage-products.service';
import { Subscription } from 'rxjs';
import { NotifyService } from 'src/app/services/notify/notify.service';

@Component({
  selector: '.app-manage-products',
  templateUrl: './manage-products.component.html',
  styleUrls: [
    './manage-products.component.scss'
  ]
})
export class ManageProductsComponent implements OnInit {

  private subscriptions: Subscription[] = []
  public categories: any[];
  public sub_categories: any[];
  public ghostLoading: boolean;
  public ghostData = [];
  public products = [];
  public groupProducts: any[];
  public disableBtn: boolean;

  constructor(
    private manageService: ManageProductsService,
    private notify: NotifyService
  ) {
    this.categories = [];
    this.sub_categories = [];
    this.ghostLoading = true;
    this.disableBtn = false;
    this.groupProducts = [{
      name: '',
      brand: '',
      description: '',
      price: ''
    }]
  }

  ngOnInit() {
    this.selectActive();
    this.getCategories()
  }

  private getCategories() {
    this.manageService.get().subscribe((data: any) => {
      data = data.collection
      for (let i = 0; i < data.length; i++) {
        this.categories.push(data[i])
      }
    })
  }

  private selectActive() {
    jquery(() => {
      jquery('.by-group').select2()
      jquery('.custom-select').select2()

      jquery('#by-category').on('select2:select', (e) => {
        var value = e.target.value,
          subC = jquery('#by-subcategory');
        if (value != '' && !isNaN(value)) {
          subC.attr('value', '')
          value = parseInt(value);
          this.sub_categories = []
          var data = this.categories[value].sub_categories;
          for (let i = 0; i < data.length; i++) {
            this.sub_categories.push({
              id: data[i].id,
              name: data[i].name,
              active: data[i].active
            })
          }
          subC.prop('disabled', '');
        }
        this.validator(e, 'next')
      });

      jquery('#by-subcategory').on('select2:select', (e) => {
        this.validator(e, 'next')
      })
    })
  }

  public validator(event?: any, nextSibling?: any) {

    if (event != undefined) {
      let element = event.target,
        sibling = element.nextSibling;
      if (nextSibling != undefined) {
        sibling = sibling.nextSibling;
      }
      if (element.value.trim() == '') {
        let classList = element.classList,
          name = '';
        classList.forEach((val: any, index: number) => {
          switch (val) {
            case 'by-category':
              name = 'Product category is required';
              break;
            case 'by-subcategory':
              name = 'Product sub-category is required';
              break;
            case 'brand-name':
              name = 'Brand name is required';
              break;
            case 'product-name':
              name = 'Product name is required';
              break;
            case 'description':
              name = 'Product description is required';
              break;
            case 'price':
              name = 'Product price is required';
              break;
          }
        })

        sibling.innerHTML = name
      } else {
        sibling.innerHTML = '';
      }
      return;
    }

    let by_category: any = document.getElementById('by-category'),
      by_subcategory: any = document.getElementById('by-subcategory'),
      allCool = true;

    // Check group
    if (by_category.value.trim() == '') {
      let category_error = document.getElementById('category-error');
      category_error.innerHTML = 'Product category is required';
      allCool = false;
    }
    if (by_subcategory.value.trim() == '') {
      let subcategory_error = document.getElementById('category-error');
      subcategory_error.innerHTML = 'Product sub-category is required';
      allCool = false;
    }

    let brand_names = document.querySelectorAll('.brand-name');
    brand_names.forEach((element: any, index: number) => {
      let sibling = element.nextSibling
      if (element.value.trim() == '') {
        sibling.innerHTML = 'Brand name is required'
        allCool = false;
      } else {
        sibling.innerHTML = '';
      }
    })

    let product_names = document.querySelectorAll('.product-name');
    product_names.forEach((element: any, index: number) => {
      let sibling = element.nextSibling
      if (element.value.trim() == '') {
        sibling.innerHTML = 'Product name is required'
        allCool = false;
      } else {
        sibling.innerHTML = '';
      }
    })

    let description = document.querySelectorAll('.description');
    description.forEach((element: any, index: number) => {
      let sibling = element.nextSibling
      if (element.value.trim() == '') {
        sibling.innerHTML = 'Product description is required'
        allCool = false;
      } else {
        sibling.innerHTML = '';
      }
    })

    let price = document.querySelectorAll('.price');
    price.forEach((element: any, index: number) => {
      let sibling = element.nextSibling
      if (element.value.trim() == '') {
        sibling.innerHTML = 'Product price is required'
        allCool = false;
      } else {
        sibling.innerHTML = '';
      }
    })

    return allCool;

  }

  public removeItem(event: any, index: number) {
    event.preventDefault();
    if (this.groupProducts.length == 1) {
      this.groupProducts = [{
        name: '',
        brand: '',
        description: '',
        price: ''
      }];
    } else {
      this.groupProducts.splice(index, 1);
    }
  }

  public addItem(event: any) {
    event.preventDefault();
    this.groupProducts.push({
      name: '',
      brand: '',
      description: '',
      price: ''
    });
  }

  public onSubmit() {

    if (!this.validator()) {
      this.notify.showNotification('info', 'Make sure you filled all required fields');
      return false;
    }

    let groupCategory: any = document.getElementById('by-category'),
      groupSubcategory: any = document.getElementById('by-subcategory');

    let category = this.categories[parseInt(groupCategory.value.trim())].id,
      subcategory = this.sub_categories[parseInt(groupSubcategory.value.trim())].id

    let data = {
      category: category,
      sub_category: subcategory,
      items: this.groupProducts
    };
    this.disableBtn = true;

    this.manageService.addProduct(data).subscribe((data: any) => {
      if (data.success) {
        this.groupProducts = [{
          name: '',
          brand: '',
          description: '',
          price: ''
        }]
        this.notify.showNotification('success', 'Items have been added');
      }else{
        this.notify.showNotification('error', data.message);
      }
      this.disableBtn = false;
    })

  }

}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemNavigatorComponent } from './item-navigator.component';

describe('ItemNavigatorComponent', () => {
  let component: ItemNavigatorComponent;
  let fixture: ComponentFixture<ItemNavigatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemNavigatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductSearchComponent } from './product-search/product-search.component';



@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    ProductSearchComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ProductsModule { }

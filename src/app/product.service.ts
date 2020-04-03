import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';
import { DepartamentService } from './departament.service';
import { Product } from './product';
import { Departament } from './departament';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  readonly url = 'http://localhost:3000/products';
  private productsSubject$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>(null);
  private loaded: boolean = false;

  constructor(
    private http: HttpClient,
    private departamentService: DepartamentService) {     }


  get(): Observable<Product[]>{
    if(!this.loaded){
      combineLatest(
        this.http.get<Product[]>(this.url),
        this.departamentService.get())
        .pipe(
          tap(([products, departament]) => console.log(products, departament)),
          filter(([products, departament]) => products != null && departament !=null),
          map(([products,departments]) => {
            for(let p of products){
              let ids = (p.departments as string[]);
              p.departments = ids.map((id) => departments.find(dep => dep._id ==id));
            }
            return products;
          }),
          tap((products) => console.log(products))
        )
        .subscribe(this.productsSubject$);

      this.loaded = true;

    }
    return this.productsSubject$.asObservable();

  }
  add(prod: Product): Observable<Product>{
    let departaments = (prod.departments as Departament[]).map(d => d._id);

    return this.http.post<Product>(this.url, {...prod, departaments})
      .pipe(
        tap((p) => {
          this.productsSubject$.getValue()
            .push({...prod, _id: p._id})
        })
      )
  }
  del(prod: Product): Observable<any>{
    return this.http.delete(`${this.url}/${prod._id}`)
    .pipe(
      tap(() => {
        let products = this.productsSubject$.getValue();
        let i = products.findIndex(p => p._id === prod._id);
        if(i >= 0 ){
          products.splice(i, 1)
        }
      })
    )
  }
  update(prod: Product): Observable<Product>{
    let departaments = (prod.departments as Departament[]).map(d => d._id);
    return this.http.patch<Product>(`${this.url}/${prod._id}`, {...prod, departaments})
    .pipe(
      tap(() => {
        let products = this.productsSubject$.getValue();
        let i = products.findIndex(p => p._id === prod._id);
        if(i >= 0 ){
          products[i] = prod;
        }
      })
    )
  }

}

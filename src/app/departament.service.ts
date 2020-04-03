import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Departament } from './departament';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepartamentService {

  readonly url = 'http://localhost:3000/departments';

  private departamentSubject$: BehaviorSubject<Departament[]> = new BehaviorSubject<Departament[]>(null);
  private loaded: boolean = false;
  constructor(private http: HttpClient) { }

  get(): Observable<Departament[]>{
    if(!this.loaded){
      this.http.get<Departament[]>(this.url)
        .pipe(
           tap((deps) => console.log(deps)),
           //delay(100)
           )
        .subscribe(this.departamentSubject$);
      this.loaded = true;
    }
    return this.departamentSubject$.asObservable();
  }

  add(d: Departament): Observable<Departament>{
    return this.http.post<Departament>(this.url, d)
    .pipe(
      tap((dep: Departament) => this.departamentSubject$.getValue().push(dep))
    )
  }
  del(dep: Departament): Observable<any> {
    return this.http.delete(`${this.url}/${dep._id}`)
      .pipe( 
        tap(()=> {
          let departments = this.departamentSubject$.getValue();
          let i = departments.findIndex(d => d._id === dep._id);
          if (i>=0)
            departments.splice(i,1);
        }
      ))
  }

  update(dep: Departament): Observable<Departament>{
    return this.http.patch<Departament>(`${this.url}/${dep._id}`, dep)
      .pipe( 
        tap((d) => {
          let departaments = this.departamentSubject$.getValue();
          let i = departaments.findIndex(d => d._id === dep._id);
          if(i>=0)
            departaments[i].name = d.name;
      })) 
  }
}


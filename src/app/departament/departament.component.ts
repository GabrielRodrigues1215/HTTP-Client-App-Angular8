import { Component, OnInit } from '@angular/core';
import { Departament } from '../departament';
import { DepartamentService } from '../departament.service';
import {  
  MatSnackBar,
  MatSnackBarConfig,} from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-departament',
  templateUrl: './departament.component.html',
  styleUrls: ['./departament.component.css']
})
export class DepartamentComponent implements OnInit {

  depName: string = "";
  depEdit: Departament = null;
  private unsubscribe$: Subject<any> =new Subject();
  departments: Departament[] = [];
  
  constructor(
    private departamentService: DepartamentService,
    public snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.departamentService.get()
      .pipe( takeUntil(this.unsubscribe$))
      .subscribe((deps) => this.departments = deps);
  }

  save(){
    if(this.depEdit){
      this.departamentService.update(
        {name: this.depName, _id: this.depEdit._id})
        .subscribe(
          (dep) => {
            this.notify('Updated!');
          },
          (err) => {
            this.notify('Error');
            console.error(err)
          }
        )
    }
    else {
      this.departamentService.add({name: this.depName})
      .subscribe(
        (dep) => {
          console.log(dep);
          this.clearFields();
          this.notify('Inserted!');
        },
        (err) => console.error(err))
    }
    this.clearFields();

  }
  clearFields(){
    this.depName = '';
    this.depEdit = null;
  }

  cancel(){
    this.clearFields();

  }
  edit(dep: Departament){
    this.depName = dep.name;
    this.depEdit = dep;
  }

  delete(dep: Departament) {
    this.departamentService.del(dep)
      .subscribe(
        () => this.notify('Removed!'),
        (err) => this.notify(err.error.msg),
      )
  }

  notify(msg: string){
    let config = new MatSnackBarConfig();

    this.snackBar.open(msg, "OK",config)
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    
  }
}

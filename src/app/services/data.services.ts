import { Injectable } from '@angular/core';


@Injectable({
  providedIn:'root'
})
export class DataService {
  
  totalRows: number
 
    constructor() {}
    setMessage(data){
      this.totalRows=data 
    }
    getMessage(){
      return this.totalRows
    }

  
  }
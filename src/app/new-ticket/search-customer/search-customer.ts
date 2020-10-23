import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import { MainCustomer } from '../../model/customer';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';


@Component({
    selector: 'app-search-customer',
    templateUrl: './search-customer.html',
})

export class SearchCustomerComponent implements OnInit {

    customers: MainCustomer[] = []
    myControl = new FormControl();
    filteredOptions: Observable<MainCustomer[]>;

    @Output() _onCustomerSelect = new EventEmitter<any>()
    @Output() _AddCus = new EventEmitter<boolean>()

    ngOnInit() {
        this.getCustomers()
    }

    getCustomers() {
        firebase.firestore().collection('customers').orderBy('name', 'asc').get().then(query => {
            this.customers = []
            query.forEach(data => {
                const customer = <MainCustomer>data.data()
                this.customers.push(customer)
            })
            // this.filteredOptions = of(this.customers)
            this.filteredOptions = this.myControl.valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filter(value))
                );
        })
    }

    private _filter(value: string): MainCustomer[] {
        const filterValue = value.toLowerCase();

        return this.customers.filter(option => option.name.toLowerCase().includes(filterValue));
    }

    onCustomerSelect(event:any) {
        this.myControl.setValue('')
        this._onCustomerSelect.emit(event)
    }

    AddCus() {
        this._AddCus.emit(true)
    }
}
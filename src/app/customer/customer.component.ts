import { MainCustomer } from './../model/customer';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';


// declare const $: any;

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class MyCustomerComponent implements OnInit, OnDestroy {

  public dataTable: DataTable;
  data: string[][] = []
  customers: MainCustomer[] = []

  addNewCus = false
  editCus = false
  currentCusRow: any

  selectedCustomer: MainCustomer

  ngOnDestroy() {

  }

  constructor() { }

  getCustomers() {
    firebase.firestore().collection('customers').orderBy('timestamp', 'desc').onSnapshot(query => {
      this.data = []
      this.customers = []
      var index = 0
      query.forEach(data => {
        const customer = <MainCustomer>data.data()
        this.customers.push(customer)
        this.data.push([customer.id, customer.name, customer.address, customer.phone, customer.email, customer.created_date, customer.modified_date,customer.created_by, 'btn-link'])
        index = index + 1

      })

      this.dataTable = {
        headerRow: ['Name', 'Address', 'Phone Number', 'Email', 'Created Date', 'Modified Date', 'Actions'],
        footerRow: ['Name', 'Address', 'Phone Number', 'Email', 'Created Date', 'Modified Date', 'Actions'],
        dataRows: this.data
      };

    });
  }

  ngOnInit() {
    this.getCustomers()
  }

  addCus() {
    this.addNewCus = true
    this.editCus = false
  }

  cancelAddCus() {
    this.addNewCus = false
    this.editCus = false
  }

  _name = ''
  _addr = ''
  _phone = ''
  _email = ''

  editCusClick(cus: any) {
    this.editCus = true
    this.addNewCus = true
    this.selectedCustomer = this.customers.find((val, ind, arr) => {
      return val.id === cus
    })
    this._name = this.selectedCustomer.name
    this._addr = this.selectedCustomer.address
    this._phone = this.selectedCustomer.phone
    this._email = this.selectedCustomer.email

  }

  async customerSubmitClicked() {
    const name = (<HTMLInputElement>document.getElementById("cus_name")).value;
    const address = (<HTMLInputElement>document.getElementById("cus_addr")).value;
    const phone = (<HTMLInputElement>document.getElementById("cus_phone")).value;
    const email = (<HTMLInputElement>document.getElementById("cus_email")).value;

    const key = firebase.database().ref().push().key
    const current_email = localStorage.getItem('email')
    const current_name = localStorage.getItem('name')


    const query = await firebase.firestore().collection('customers').where('email', '==', email).get()
    if (query.size > 0) {
      console.log('customer already exists')
      return
    }

    if (!this.editCus) {
      const customer: MainCustomer = {
        id: key,
        name: name,
        address: address,
        phone: phone,
        email: email,
        created_by: `${current_name}|${current_email}`,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }
      firebase.firestore().collection('customers').doc(key).set(customer).then(d => {
        this.cancelAddCus()
      }).catch(err => {
        console.log(err);
      })
    } else {//you are to perform update operattion here
      const customer: MainCustomer = {
        name: name,
        address: address,
        phone: phone,
        email: email,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
      }
      firebase.firestore().collection('customers').doc(this.selectedCustomer.id).update(customer).then(d => {
        this.cancelAddCus()
      }).catch(err => {
        console.log(err);
      })
    }
  }

  ngAfterViewInit() {
    //$.noConflict();
    (<any>$('#datatables')).DataTable({
      "pagingType": "full_numbers",
      "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
      ],
      responsive: true,
      language: {
        search: "_INPUT_",
        searchPlaceholder: "Search records",
      }

    });

    const table = (<any>$('#datatables')).DataTable();

    $('.card .material-datatables label').addClass('form-group');
  }
}

import { MainCustomer } from './../model/customer';
import { Component, OnInit, AfterViewInit, OnDestroy, EventEmitter, Input } from '@angular/core';
import * as firebase from 'firebase/app';
import * as geofirex from 'geofirex'; 
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { AppConfig } from '../services/global.service';
import swal from 'sweetalert2';


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

export class MyCustomerComponent implements OnInit {

  public dataTable: DataTable;
  data: string[][] = []
  customers: MainCustomer[] = []

  addNewCus = false
  editCus = false
  currentCusRow: any

  selectedCustomer: MainCustomer

  config = new AppConfig()

  button_pressed = false

  initAutoComplete() {

    //console.log('i dey here')
    const locationInput = (<HTMLInputElement>document.getElementById("cus_addr"));
    //var input = document.getElementById('bisLoc')
    var autocomplete = new google.maps.places.Autocomplete(locationInput);
    // Set the data fields to return when the user selects a place.
    autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

    autocomplete.addListener('place_changed', function () {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        //return;
      }
      // console.log(place.geometry.location.toJSON())
      document.getElementById('mgeo').innerHTML = JSON.stringify(place.geometry.location.toJSON())
      //marker.setPosition(place.geometry.location);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
        // console.log(address)
        document.getElementById('madd').innerHTML = address
      }
    });
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
        this.data.push([customer.id, customer.name, customer.address, customer.phone, customer.email, customer.created_date, customer.modified_date, customer.created_by, 'btn-link'])
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
    setTimeout(() => {
      this.initAutoComplete()
    }, 3000)
  }

  cancelAddCus() {
    this.addNewCus = false
    this.editCus = false
    this.button_pressed = false
  }

  _name = ''
  _addr = ''
  _phone = ''
  _email = ''

  deleteCusClick(id: string, email:string) {
    swal({
        title: 'Delete Alert',
        text: 'Are you sure about deleting this customer?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-danger",
        buttonsStyling: false
    }).then((result) => {
        if (result.value) {
            firebase.firestore().collection('customers').doc(id).delete().then(del => {
                const current_email = localStorage.getItem('email')
                const current_name = localStorage.getItem('name')
                this.config.logActivity(`${current_name}|${current_email} deleted this customer: ${email}`)
                this.config.displayMessage("Successfully deleted", true);
            }).catch(err => {
                this.config.displayMessage(`${err}`, false);
            })
        } else {
            swal({
                title: 'Cancelled',
                text: 'Deletion not successful',
                type: 'error',
                confirmButtonClass: "btn btn-info",
                buttonsStyling: false
            }).catch(swal.noop)
        }
    })
}

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
    setTimeout(() => {
      document.getElementById('madd').innerHTML = this.selectedCustomer.address
      document.getElementById('mgeo').innerHTML = JSON.stringify(this.selectedCustomer.position.geopoint)
      this.initAutoComplete()
    }, 3000)

  }

  ticketCusClick(email:string) {
    location.href = `/new-ticket?customer=${email}`
  }

  async customerSubmitClicked() {
    const name = (<HTMLInputElement>document.getElementById("cus_name")).value;
    // const address = (<HTMLInputElement>document.getElementById("cus_addr")).value;
    const phone = (<HTMLInputElement>document.getElementById("cus_phone")).value;
    const email = (<HTMLInputElement>document.getElementById("cus_email")).value;

    const addr = document.getElementById('madd').innerHTML

    if (name === '' || phone === '' || addr === '' || email === '') {
      this.config.displayMessage('Please fill all fields and use google autocomplete for address.', false)
      return
    }

    const geo = JSON.parse(document.getElementById('mgeo').innerHTML)
    this.button_pressed = true

    const key = firebase.database().ref().push().key
    const current_email = localStorage.getItem('email')
    const current_name = localStorage.getItem('name')
    const geoPoint = geofirex.init(firebase);

    if (!this.editCus) {//add new customer
      const query = await firebase.firestore().collection('customers').where('email', '==', email).get()
      if (query.size > 0) {
        this.button_pressed = false
        this.config.displayMessage('customer already exists', false)
        return
      }
      const position = geoPoint.point(geo['lat'], geo['lng'])
      const customer: MainCustomer = {
        id: key,
        name: name,
        address: addr,
        position: {
          geohash: position.geohash,
          geopoint: position.geopoint
        },
        phone: phone,
        email: email,
        created_by: `${current_name}|${current_email}`,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }
      firebase.firestore().collection('customers').doc(email.toLowerCase()).set(customer).then(d => {
        this.config.logActivity(`${current_name}|${current_email} created this customer: ${email}`)
        this.cancelAddCus()
        this.config.displayMessage('Successfully created', true)
      }).catch(err => {
        this.button_pressed = false
        this.config.displayMessage(`${err}`, false)
      })
    } else {//you are to perform update operattion here
      const position = (geo['lat'] === undefined) ? geoPoint.point(geo['latitude'], geo['longitude']) : geoPoint.point(geo['lat'], geo['lng'])
      const customer: MainCustomer = {
        name: name,
        address: addr,
        position: {
          geohash: position.geohash,
          geopoint: position.geopoint
        },
        phone: phone,
        email: email,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
      }
      firebase.firestore().collection('customers').doc(this.selectedCustomer.email).update(customer).then(d => {
        this.config.logActivity(`${current_name}|${current_email} updated this customer: ${email}`)
        this.cancelAddCus()
        this.config.displayMessage('Successfully updated', true)
      }).catch(err => {
        this.button_pressed = false
        this.config.displayMessage(`${err}`, false)
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

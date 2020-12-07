import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
// import * as geo from 'geofirestore'
import * as geofirex from 'geofirex';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { MainCategory } from '../model/category';
import { AppConfig } from '../services/global.service';
import { AdminUsers } from '../model/admin.users';
import { MainCustomer } from '../model/customer';
import { Jobs } from '../model/jobs';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.module';
import { OverlayService } from '../overlay/overlay.module';
import { JobActivity } from '../model/activity';
import { AdminUsersService } from '../services/admin-users.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { startWith, } from 'rxjs/operators';

declare var google: any;
let map: any;
let marker: any = {}
const options = {
  enableHighAccuracy: true,
  timeout: 60000,
  maximumAge: 0
};
let infowindow: any;
const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';


@Component({
  selector: 'app-new-ticket',
  templateUrl: './new-ticket.component.html',
  styleUrls: ['./new-ticket.component.css']
})

export class MyNewTicketComponent implements OnInit, OnDestroy {

  @ViewChild('map', { static: false }) mapElement: ElementRef;

  markerPan: any

  initMap() {
    navigator.geolocation.getCurrentPosition((location) => {
      map = new google.maps.Map(this.mapElement.nativeElement, {
        center: { lat: location.coords.latitude, lng: location.coords.longitude },
        zoom: 10
      });

      infowindow = new google.maps.InfoWindow();


      marker['current'] = new google.maps.Marker({
        position: { lat: location.coords.latitude, lng: location.coords.longitude },
        map,
        title: 'Click to zoom',
        icon: iconBase + 'blue-dot.png'
      });

      this.markerPan = marker['current']

      map.addListener('center_changed', () => {
        window.setTimeout(() => {
          map.panTo(this.markerPan.getPosition());
        }, 3000);
      });

      marker['current'].addListener('click', (event: any) => {
        infowindow.setPosition(event.latLng);
        infowindow.setContent(`Current location`);// +'<h3><a href="/add-donor/' + marker.getPosition().lat() + '/' + marker.getPosition().lng() + '">Register Here</a></h3>
        infowindow.open(map, marker['current']);
      });
    }, (error) => {
      this.config.displayMessage(`${error.message}. Refresh this page.`, false);
    }, options);
  }

  // createMarkers(place: any) {
  //   const latitude = parseFloat(place.coords.latitude);
  //   const longitude = parseFloat(place.coords.longitude);
  //   const donorMarker = new google.maps.Marker({
  //     map,
  //     position: { lat: latitude, lng: longitude },
  //     icon: iconBase + 'green-dot.png'
  //   });

  //   google.maps.event.addListener(donorMarker, 'click', function () {
  //     infowindow.setContent('<h3>' + place.name + '</h3><p>Phone number: ' + place.phone + '<br>Email: ' + place.email + '</p>');
  //     infowindow.open(map, this);
  //   });
  // }

  createMarker(latitude: any, longitude: any, _id: any, tech: any) {
    const isReassign = this.isReassign
    const stat = `${tech['status']}` //status of technician: offline, online
    const display = (stat === 'online') ? 'block' : 'none'

    marker[_id] = new google.maps.Marker({
      map,
      position: { lat: latitude, lng: longitude },
      icon: (stat === 'online') ? iconBase + 'green-dot.png' : iconBase + 'red-dot.png'
    });

    this.markerPan = marker[_id]

    google.maps.event.addListener(marker[_id], 'click', function () {
      infowindow.setContent(`<div class="card">
      <div class="card-header card-header-text card-header-rose">
        <div class="card-text">
          <h4 class="card-title">${tech['name']}</h4>
        </div>
        <div class="card-body">
        <label>Email Address: <a href="mailto:${tech['email']}">${tech['email']}</a></label><br>
        <label>Phone Number: <a href="tel:${tech['phone']}">${tech['phone']}</a></label><br>
        <label>Address: <a href="https://google.com/maps/${tech['address']}">${tech['address']}</a></label><br>
        <label>Status: ${tech['status']}</label><br>
        </div>
        <div class="card-footer">
        <button style="display: ${display};" mat-raised-button type="button" id="${_id}" class="btn btn-fill btn-rose btn-block">
              ${(isReassign) ? 'Re-Assign' : 'Assign'}
        </button>
        </div>
      </div>
      </div>`)//(click)="assignClicked('hello')"
      infowindow.open(map, marker[_id])
      setTimeout(() => {
        //listen for onclick
        document.getElementById(_id).addEventListener('click', () => {
          document.getElementById('assign-id').innerText = _id
          document.getElementById('assignBtnClick').click()
        })
      }, 500)
    });
  }


  constructor(private http: HttpClient, private previewProgressSpinner: OverlayService) {
    // this.initMap();
    const current_state = sessionStorage.getItem('current_state')
    if (current_state !== null) {
      if (current_state !== '') {
        const json = JSON.parse(current_state)
        this._cat = json._cat
        // this._addr = json._addr
        this.radius = json.radius
        this._note = json._note
        // this.isReassign = json.isReassign
        // this.hasURLQuery = json.hasURLQuery
        this.isAddNewCus = json.isAddNewCus
        this._name = json._name
        this._cus_addr = json._cus_addr
        this._phone = json._phone
        this._email = json._email
      }
    }
  }

  ngOnDestroy(): void {
    const sessionState = {
      _cat: this._cat,
      // _addr: this._addr,
      radius: this.radius,
      _note: this._note,
      // isReassign: this.isReassign,
      // hasURLQuery: this.hasURLQuery,
      isAddNewCus: this.isAddNewCus,
      _name: this._name,
      _cus_addr: this._cus_addr,
      _phone: this._phone,
      _email: this._email,
      // _addr: this._addr,
      // _addr: this._addr,
    }
    sessionStorage.setItem('current_state', JSON.stringify(sessionState))
  }

  config = new AppConfig()
  service = new AdminUsersService()
  categories: MainCategory[] = []
  technicians: any[] = []
  _cat: string[] = []
  _addr = ''
  radius = 10
  _note = ''

  selectedCustomer: MainCustomer
  currentUser: AdminUsers

  button_pressed = false

  isReassign = false
  selectedJob: Jobs

  hasURLQuery = false
  isAddNewCus = false

  //for adding new customers
  _name = ''
  _cus_addr = ''
  _phone = '+234'
  _email = ''

  onCustomerSelect(evt: any) {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
    const email = evt.option.value
    this.isAddNewCus = false
    this.hasURLQuery = true
    this.getCustomerByEmail(email).then(d => {
      this.previewProgressSpinner.close()
      // this.myControl.setValue('')
      setTimeout(() => {
        this.initMap()
      }, 2000)
      setTimeout(() => {
        this.initAutoComplete()
      }, 2000)
    })
  }

  AddCus(evt: boolean) {
    this.isAddNewCus = evt
    setTimeout(() => {
      this.initAutoComplete()
    }, 2000)
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

    if (!phone.startsWith('+234')) {
      this.config.displayMessage('Please input correct address. Must start with +234', false)
      return
    }

    const geo = JSON.parse(document.getElementById('mgeo').innerHTML)
    this.button_pressed = true

    const key = firebase.database().ref().push().key
    const current_email = localStorage.getItem('email')
    const current_name = localStorage.getItem('name')
    const geoPoint = geofirex.init(firebase);

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
      this.button_pressed = false
      this.config.logActivity(`${current_name}|${current_email} created this customer: ${email}`)
      this.onCustomerSelect({ option: { value: email } })
    }).catch(err => {
      this.button_pressed = false
      this.config.displayMessage(`${err}`, false)
    })
  }

  gotoSearch() {
    this.hasURLQuery = false
  }

  ngOnInit() {
    if (location.search !== '') {
      this.hasURLQuery = true
      // this.config.displayMessage('Please select a customer for this ticket.', false)
      // setTimeout(() => {
      //   location.href = '/customer'}, 2000
      // )
      // return
      const customerEmail = this.config.getUrlParameter('customer')
      const job_id = this.config.getUrlParameter('jobid')
      // console.log(customerEmail, job_id)
      this.getCustomerByEmail(customerEmail)
      if (job_id !== undefined) {
        this.isReassign = true
        this.getJobDataById(job_id)
      }
      setTimeout(() => {
        this.initMap()
      }, 2000)
      setTimeout(() => {
        this.initAutoComplete()
      }, 2000)
    }
    // this.getCustomers()
    this.getCategories()
    const email = localStorage.getItem('email');
    this.service.getUserData(email).then(user => {
      this.currentUser = user
    })
  }

  /**
   * get the customer data from firebase provided the email is given
   * @param email string
  */
  async getCustomerByEmail(email: string) {
    const query = await firebase.firestore().collection('customers').doc(email.toLowerCase()).get()
    if (!query.exists) {
      this.config.displayMessage('Invalid customer.', false)
      setTimeout(() => {
        location.href = '/customer'
      }, 2000
      )
      return
    }
    this.selectedCustomer = <MainCustomer>query.data()
    this._addr = this.selectedCustomer.address
    setTimeout(() => {
      document.getElementById('madd').innerHTML = this.selectedCustomer.address
      document.getElementById('mgeo').innerHTML = JSON.stringify(this.selectedCustomer.position.geopoint)
    }, 3000)
  }

  /**
   * get the job data from firebase provided the id is given
   * @param id string
   */
  async getJobDataById(id: string) {
    const query = await firebase.firestore().collection('jobs').doc(id).get()
    if (!query.exists) {
      this.config.displayMessage('Invalid job ID.', false)
      setTimeout(() => {
        location.href = '/customer'
      }, 2000
      )
      return
    }
    this.selectedJob = <Jobs>query.data()
    this._cat = this.selectedJob.category
    this._note = this.selectedJob.note
  }

  /**
   * get list of categories to be displayed when seareching for technicians
   */
  getCategories() {
    firebase.firestore().collection('categories').orderBy('name', 'asc').get().then(query => {
      this.categories = []
      query.forEach(data => {
        const category = <MainCategory>data.data()
        this.categories.push(category)
      })
    });
  }

  initAutoComplete() {
    const locationInput = (this.isAddNewCus) ? (<HTMLInputElement>document.getElementById("cus_addr")) : (<HTMLInputElement>document.getElementById("formGroupExampleInput2"))
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

  searchButtonClick() {
    const addr = document.getElementById('madd').innerHTML//addr === '' ||
    if (this._cat.length === 0 || addr === '' || this.radius === 0 || this.radius === null) {
      this.config.displayMessage('please fill all fields with *', false)
      return
    }
    this.searchForTechnicians()
  }

  /**
   * perform search on firebase using geofirex library
  */
  async searchForTechnicians() {
    this.button_pressed = true

    // Create a GeoFirestore reference
    const GeoFirestore = geofirex.init(firebase)

    // Create a GeoCollection reference
    const geocollection = firebase.firestore().collection('users').where('user_type', '==', 'technician').where('category', 'array-contains-any', this._cat).where('blocked', '==', false)

    //get the geopoint from the input address
    const geopoint = JSON.parse(document.getElementById('mgeo').innerHTML)

    const center = (geopoint['lat'] === undefined) ? GeoFirestore.point(geopoint['latitude'], geopoint['longitude']) : GeoFirestore.point(geopoint['lat'], geopoint['lng'])

    // Create a GeoQuery based on a location
    GeoFirestore.query(geocollection).within(center, this.radius, 'position').subscribe(query => {
      // console.log(query)
      this.button_pressed = false
      if (query.length === 0) {
        this.config.displayMessage('No technicians found. Try again!', false)
        return
      }

      //remove markers
      this.technicians = []
      // map.marke
      query.forEach(tech => {
        this.technicians.push(tech)
        const coords = tech['position']
        const point = coords['geopoint']
        // console.log(tech)
        this.createMarker(point['latitude'], point['longitude'], tech['id'], tech)
        // console.log(tech)
      })
    })

  }

  assignClicked() {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
    const id = document.getElementById('assign-id').innerText//goto line 46 in the html file
    const findTech = this.technicians.find((val, ind, arr) => {
      return val['id'] === id
    })
    //convert technician object to interface object
    const technician: AdminUsers = {
      name: findTech['name'],
      blocked: findTech['blocked'],
      address: findTech['address'],
      position: findTech['position'],
      phone: findTech['phone'],
      email: `${findTech['email']}`.toLowerCase(),
      category: findTech['category'],
      status: findTech['status']
    }

    const current_email = localStorage.getItem('email')
    const current_name = localStorage.getItem('name')
    const key = firebase.database().ref().push().key

    if (!this.isReassign) {//add new job
      const job: Jobs = {
        id: key,
        job_id: this.config.randomInt(0, 9999999999),
        customer: this.selectedCustomer,
        assigned_to: technician,
        agent: this.currentUser,
        status: 'Pending',//will be changed later
        back_end_status: 'active',
        category: this._cat,
        note: this._note,
        created_by: `${current_name}|${current_email}`,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }

      firebase.firestore().collection('jobs').doc(key).set(job).then(d => {
        //create activity collection
        const id = firebase.database().ref().push().key
        const act: JobActivity = {
          id: id,
          comment: `This job was created for : ${this.selectedCustomer.name} and assigned to ${technician.name}`,
          created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
        firebase.firestore().collection('jobs').doc(key).collection('activities').doc(id).set(act).then(d => {
          this.previewProgressSpinner.close()
          this.config.logActivity(`${current_name}|${current_email} created this job for : ${this.selectedCustomer.name} and assigned to ${technician.name}`)
          this.sendSMS(findTech['name'], findTech['phone'], findTech['msgID'], findTech['email'])
          this.config.displayMessage('Successfully created', true)
          setTimeout(() => {
            location.href = '/jobs'
          }, 2000)
        }).catch(err => {
          this.previewProgressSpinner.close()
          this.config.displayMessage(`${err}`, false)
        })
      }).catch(err => {
        this.previewProgressSpinner.close()
        this.config.displayMessage(`${err}`, false)
      })
    } else {//update job that needs reassigning
      const job: Jobs = {
        customer: this.selectedCustomer,
        assigned_to: technician,
        agent: this.currentUser,
        status: 'Pending',//this.selectedJob.status,//
        back_end_status: 'active',
        category: this._cat,
        note: this._note,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      }
      firebase.firestore().collection('jobs').doc(this.selectedJob.id).update(job).then(d => {
        //create activity collection
        const id = firebase.database().ref().push().key
        const act: JobActivity = {
          id: id,
          comment: `This job was updated for : ${this.selectedCustomer.name} and reassigned to ${technician.name}`,
          created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
        firebase.firestore().collection('jobs').doc(this.selectedJob.id).collection('activities').doc(id).set(act).then(d => {
          this.previewProgressSpinner.close()
          this.config.logActivity(`${current_name}|${current_email} updated this job for : ${this.selectedCustomer.name} and reassigned to ${technician.name}`)
          this.sendSMS(findTech['name'], findTech['phone'], findTech['msgID'], findTech['email'])
          this.config.displayMessage('Successfully created', true)
        }).catch(err => {
          this.previewProgressSpinner.close()
          this.config.displayMessage(`${err}`, false)
        })
      }).catch(err => {
        this.previewProgressSpinner.close()
        this.config.displayMessage(`${err}`, false)
      })
    }
  }

  sendSMS(tech_name: string, tech_number: string, ids: string[], email: string) {
    const techSMS = `You have been assigned a job. Please login to Pronto to accept the job and to view customer details.`
    const cusSMS = `A technician will be with you shortly. \nName: ${tech_name}\nPhone: ${tech_number}`

    this.config.sendSMS(this.http, tech_number, techSMS, ids.join(','), 'notification', email)
    // this.config.sendSMS(this.http, this.selectedCustomer.phone, cusSMS, '', 'sms')
  }

  //update technician status to assign and send sms to both customer and technician


}

import { DataService } from './../services/data.services';
import { MainTechnician } from './../model/technician';
import { Component, OnInit, AfterViewInit, OnDestroy, Output } from '@angular/core';
import * as firebase from 'firebase/app';
import * as geofirex from 'geofirex';
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { AppConfig } from '../services/global.service';
import { AdminUsers } from '../model/admin.users';
import { MainCategory } from '../model/category';
import swal from 'sweetalert2';
import { AdminUsersService } from '../services/admin-users.service';
import { EventEmitter } from '@angular/core';



declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

// declare const $: any;

@Component({
  selector: 'app-technician',
  templateUrl: './technician.component.html',
  styleUrls: ['./technician.component.css']
})

export class MyTechnicianComponent implements OnInit, OnDestroy {

  // @Output() public found = new EventEmitter<any>();

  public dataTable: DataTable;
  data: string[][] = []
  technicians: AdminUsers[] = []
  categories: MainCategory[] = []

  addNewTech = false
  editTech = false
  currentTechRow: any

  selectedTechnician: AdminUsers

  config = new AppConfig()
  button_pressed = false

  user_blocked = 'no'

  service = new AdminUsersService();
  role = ''

  ngOnDestroy() {

  }



  getCategories() {
    firebase.firestore().collection('categories').orderBy('name', 'asc').get().then(query => {
      this.categories = []
      query.forEach(data => {
        const category = <MainCategory>data.data()
        this.categories.push(category)
      })
    });
  }

  



  getTechnicians() {// db/categories/main-categories
    firebase.firestore().collection('users').where('user_type', '==', 'technician').orderBy('timestamp', 'desc').onSnapshot(query => {
      this.data = []
      this.technicians = []
      var index = 0
      query.forEach(data => {
        const technician = <AdminUsers>data.data()
        this.technicians.push(technician)
        this.data.push([technician.id, technician.name, technician.address, technician.phone, technician.email, technician.created_date, technician.modified_date, technician.created_by, 'btn-link'])
        index = index + 1
      })
      this.dataTable = {
        headerRow: ['Name', 'Address', 'Phone Number', 'Email', 'Created Date', 'Modified Date', 'Actions'],
        footerRow: ['Name', 'Address', 'Phone Number', 'Email', 'Created Date', 'Modified Date', 'Actions'],
        dataRows: this.data
      };
    });
  }


  
  

  // totalNumber: number
  // constructor(private datas: DataService) { }
  // get totalRows(): number {
  //   return this.getTechnicians.length;
  // }
  // doCount(): any {
  //   this.datas.getMeTech(this.totalNumber).then((data: any) => {
  //     for (var i = 0; i < data.Results.length; i++) {
  //       let searchObj = new SearchResults(data.Results[i]);

  //       this.found.emit(searchObj);

  //     }
  //   });

  // }

  initAutoComplete() {

    //console.log('i dey here')
    const locationInput = (<HTMLInputElement>document.getElementById("tech_addr"));
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


  ngOnInit() {
    const email = localStorage.getItem('email');
    this.service.getUserData(email).then(user => {
      this.role = user.role
      this.getCategories()
      this.getTechnicians()
    })
    // this.datas.setMessage(this.totalRows)
  }

  addTech() {
    this.addNewTech = true
    this.editTech = false
    setTimeout(() => {
      this.initAutoComplete()
    }, 3000)
  }

  cancelAddTech() {
    this.addNewTech = false
    this.editTech = false
    this.button_pressed = false
  }

  _name = ''
  _addr = ''
  _phone = '+234'
  _email = ''
  _cat = []

  deleteTechClick(id: string, email: string) {
    swal({
      title: 'Delete Alert',
      text: 'Are you sure about deleting this technician?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        firebase.firestore().collection('users').doc(email).delete().then(del => {
          const current_email = localStorage.getItem('email')
          const current_name = localStorage.getItem('name')
          this.config.logActivity(`${current_name}|${current_email} deleted this technician: ${email}`)
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

  editTechClick(tech: any) {
    this.editTech = true
    this.addNewTech = true
    this.selectedTechnician = this.technicians.find((val, ind, arr) => {
      return val.id === tech
    })
    this._name = this.selectedTechnician.name
    this._addr = this.selectedTechnician.address
    this._phone = this.selectedTechnician.phone
    this._email = this.selectedTechnician.email
    this._cat = this.selectedTechnician.category
    this.user_blocked = this.selectedTechnician.blocked ? 'yes' : 'no'
    setTimeout(() => {
      document.getElementById('madd').innerHTML = this.selectedTechnician.address
      document.getElementById('mgeo').innerHTML = JSON.stringify(this.selectedTechnician.position.geopoint)
      this.initAutoComplete()
    }, 3000)
  }

  async technicianSubmitClicked() {
    const name = (<HTMLInputElement>document.getElementById("tech_name")).value;
    // const address = (<HTMLInputElement>document.getElementById("tech_addr")).value;
    const phone = (<HTMLInputElement>document.getElementById("tech_phone")).value;
    const email = (<HTMLInputElement>document.getElementById("tech_email")).value;
    // const category = (<HTMLInputElement>document.getElementById("tech_cat")).value;
    const addr = document.getElementById('madd').innerHTML
    if (name === '' || phone === '' || addr === '' || email === '' || this._cat.length === 0) {
      this.config.displayMessage('Please fill all fields and use google autocomplete for address.', false)
      return
    }

    if(!phone.startsWith('+234')){
      this.config.displayMessage('Please input correct address. Must start with +234', false)
      return
    }

    const geo = JSON.parse(document.getElementById('mgeo').innerHTML)
    this.button_pressed = true
    const key = firebase.database().ref().push().key


    const current_email = localStorage.getItem('email')
    const current_name = localStorage.getItem('name')
    const geoPoint = geofirex.init(firebase);

    if (!this.editTech) {
      //determin if email exists
      const query = await firebase.firestore().collection('users').where('email', '==', email).get()
      if (query.size > 0) {
        this.config.displayMessage('technician already exists', false)
        return
      }
      const position = geoPoint.point(geo['lat'], geo['lng'])
      const technician: AdminUsers = {
        id: key,
        name: name,
        address: addr,
        position: {
          geohash: position.geohash,
          geopoint: position.geopoint
        },//new firebase.firestore.GeoPoint(geo['lat'], geo['lng']),
        phone: phone,
        email: email,
        category: this._cat,
        role: 'Technician',
        access_levels: '',
        blocked: (this.user_blocked === 'no') ? false : true,
        status: 'offline',
        user_type: 'technician',
        image: './assets/img/default-avatar.png',
        user_position: 'Technician',
        created_by: `${current_name}|${current_email}`,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }
      firebase.firestore().collection('users').doc(email.toLowerCase()).set(technician).then(d => {
        this.config.logActivity(`${current_name}|${current_email} created this technician: ${email}`)
        this.cancelAddTech()
        this.config.displayMessage('Successfully created', true)
      }).catch(err => {
        this.button_pressed = false
        this.config.displayMessage(`${err}`, false)
      })
    } else {//you are to perform update operattion here
      const position = (geo['lat'] === undefined) ? geoPoint.point(geo['latitude'], geo['longitude']) : geoPoint.point(geo['lat'], geo['lng'])
      const technician: AdminUsers = {
        name: name,
        blocked: (this.user_blocked === 'no') ? false : true,
        address: addr,
        position: {
          geohash: position.geohash,
          geopoint: position.geopoint
        },
        // coordinates: (geo['lat'] === undefined) ? new firebase.firestore.GeoPoint(geo['latitude'], geo['longitude']) : new firebase.firestore.GeoPoint(geo['lat'], geo['lng']),
        phone: phone,
        email: email,
        category: this._cat,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
      }
      firebase.firestore().collection('users').doc(this.selectedTechnician.email).update(technician).then(d => {
        this.config.logActivity(`${current_name}|${current_email} updated this technician: ${email}`)
        this.cancelAddTech()
        this.config.displayMessage('Successfully updated', true)
      }).catch(err => {
        this.button_pressed = false
        this.config.displayMessage(`${err}`, false)
      })
    }

  }

  ngAfterViewInit() {

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








  //   async addNewTechnician(){
  //     const key = firebase.database().ref().push().key
  //     const email = localStorage.getItem('email')
  //     const name = localStorage.getItem('name')

  //     const technician:Technician={
  //       id: key,
  //       name:'kiki',
  //       address:'maryland',
  //       phone:'1266778',
  //       email: '@me.com',
  //       created_by:`${name} | ${email}`,
  //       created_date: `${new Date().toDateString()} - ${new Date().toTimeString()}`,
  //       modified_date: `${new Date().toDateString()} - ${new Date().toTimeString()} `,
  //       timestamp: firebase.firestore.FieldValue.serverTimestamp()

  //     }

  //     await firebase.firestore().collection('technicians').doc(key).set(technician)
  //   }

  //   async updateTechnician(key:string){
  //     const technician:Technician={

  //       name: 'kiki',
  //       address:'anthony village',
  //       phone:'377487428',
  //       email:'@me.com',
  //       modified_date: `${new Date().toDateString()} - ${new Date().toTimeString()} `,

  //     }
  //     await firebase.firestore().collection('technicians').doc(key).update(technician)
  //   }


  //   async deleteTechnician(){
  //     const key = ''
  //     await firebase.firestore().collection('technicians').doc(key).delete()
  //   }

  //   async getAllTechnicians(){
  //     const techs: Technician[] = []

  //      firebase.firestore().collection('technicians').onSnapshot(_techs =>{
  //       _techs.forEach(t =>{
  //         const th = <Technician>t.data()
  //         techs.push(th)
  //       })
  //     })



  //     this.updateTechnician(techs[0].id)
  //     const getTech = await this.getTechnicians(techs[0].id)

  //   const particularAreaTech = techs.filter((val, ind,arr)=>{
  //       return val.address.includes('lekki')
  //     })
  //   }
  //   async getTechnicians(key:string){
  //     const tech = await firebase.firestore().collection('technicials').doc(key).get()
  //     return <Technician>tech.data()
  //   }



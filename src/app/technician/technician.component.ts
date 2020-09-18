import { MainTechnician } from './../model/technician';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';


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

  public dataTable: DataTable;
  data: string[][] = []
  technicians: MainTechnician[] = []

  addNewTech = false
  editTech = false
  currentTechRow: any

  selectedTechnician: MainTechnician

  ngOnDestroy() {

  }

  constructor() { }

  getTechnicians() {// db/categories/main-categories
    //colloection('db').doc('').colloection('main-technicians)
    firebase.firestore().collection('technicians').orderBy('timestamp', 'desc').onSnapshot(query => {
      this.data = []
      this.technicians = []
      var index = 0
      query.forEach(data => {
        const technician = <MainTechnician>data.data()
        this.technicians.push(technician)
        this.data.push([technician.id, technician.name, technician.address, technician.phone, technician.email, technician.category, technician.created_date, technician.modified_date, technician.created_by, 'btn-link'])
        index = index + 1
      })
      this.dataTable = {
        headerRow: ['Name', 'Address', 'Phone Number', 'Email', 'Category', 'Created Date', 'Modified Date', 'Actions'],
        footerRow: ['Name', 'Address', 'Phone Number', 'Email', 'Category', 'Created Date', 'Modified Date', 'Actions'],
        dataRows: this.data
      };
    });
  }




  ngOnInit() {
    this.getTechnicians()
  }

  addTech() {
    this.addNewTech = true
    this.editTech = false
  }

  cancelAddTech() {
    this.addNewTech = false
    this.editTech = false
  }

  _name = ''
  _addr = ''
  _phone = ''
  _email = ''
  _cat = ''

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

  }

  async technicianSubmitClicked() {
    const name = (<HTMLInputElement>document.getElementById("tech_name")).value;
    const address = (<HTMLInputElement>document.getElementById("tech_addr")).value;
    const phone = (<HTMLInputElement>document.getElementById("tech_phone")).value;
    const email = (<HTMLInputElement>document.getElementById("tech_email")).value;
    const category = (<HTMLInputElement>document.getElementById("tech_cat")).value;


    const key = firebase.database().ref().push().key


    const current_email = localStorage.getItem('email')
    const current_name = localStorage.getItem('name')

    //determin if email exists
    const query = await firebase.firestore().collection('technicians').where('email', '==', email).get()
    if (query.size > 0) {
      console.log('technician already exists')
      return
    }

    if (!this.editTech) {
      const technician: MainTechnician = {
        id: key,
        name: name,
        address: address,
        phone: phone,
        email: email,
        category: category,
        created_by: `${current_name}|${current_email}`,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }
      firebase.firestore().collection('technicians').doc(key).set(technician).then(d => {
        this.cancelAddTech()
      }).catch(err => {
        console.log(err);
      })
    } else {//you are to perform update operattion here
      const technician: MainTechnician = {
        name: name,
        address: address,
        phone: phone,
        email: email,
        category: category,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
      }
      firebase.firestore().collection('technicians').doc(this.selectedTechnician.id).update(technician).then(d => {
        this.cancelAddTech()
      }).catch(err => {
        console.log(err);
      })
    }

  }


  //drop down
  selectedValue: string;
  currentCategory: string[];

  selectTheme = 'primary';
  Techies = [
    { value: 'plumber-0', viewValue: 'Plumber' },
    { value: 'electrician-1', viewValue: 'Electrician' },
    { value: 'carpenter-2', viewValue: 'Carpenter' },
    { value: 'painter-3', viewValue: 'Painter' },
    { value: 'bricklayer-4', viewValue: 'Brick Layer' },
    { value: 'gardner-5', viewValue: 'Gardner' },
    { value: 'shoemaker-6', viewValue: 'Shoe Maker' },
    { value: 'cleaner-7', viewValue: 'Cleaner' },
    { value: 'mechanic-8', viewValue: 'Automobile Mechanic' },

  ];

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



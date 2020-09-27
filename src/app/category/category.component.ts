import { MainCategory } from './../model/category';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { AppConfig } from '../services/global.service';
import swal from 'sweetalert2';
import { AdminUsersService } from '../services/admin-users.service';


// declare const $: any;

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class MyCategoryComponent implements OnInit {

  public dataTable: DataTable;
  data: string[][] = []
  categories: MainCategory[] = []

  addNewCat = false
  editCat = false
  currentCatRow: any

  selectedCategory: MainCategory

  config = new AppConfig
  modal_name = ""
  modal_geo = ''
  button_pressed = false

  service = new AdminUsersService();
  role = ''

  constructor() { }

  getCategories() {
    firebase.firestore().collection('categories').orderBy('timestamp', 'desc').onSnapshot(query => {
      this.data = []
      this.categories = []
      var index = 0
      query.forEach(data => {
        const category = <MainCategory>data.data()
        this.categories.push(category)
        this.data.push([category.id, category.name, category.created_date, category.modified_date, 'btn-link'])
        index = index + 1
      })

      this.dataTable = {
        headerRow: ['Name', 'Created Date', 'Modified Date', 'Actions'],
        footerRow: ['Name', 'Created Date', 'Modified Date', 'Actions'],
        dataRows: this.data
      };
    });
  }
  totalCategory(){
    
  }
  // get totalRows(): number {
  //   return this.getCategories.length;
  // }
  // totalRows() {
  //   for (let index = 0; index < this.data.length; index++) {
  //     if (index > 0) {
  //       return index
  //     }
  //     else { return 0 }
  //   }
  // }


  ngOnInit() {
    const email = localStorage.getItem('email');
    this.service.getUserData(email).then(user => {
      this.role = user.role
      this.getCategories()
    })
  }

  addCat() {
    this.addNewCat = true
    this.editCat = false
  }

  cancelAddCat() {
    this.addNewCat = false
    this.editCat = false
    this.button_pressed = false
  }

  _name = ''

  editCatClick(cat: any) {
    this.editCat = true
    this.addNewCat = true
    this.selectedCategory = this.categories.find((val, ind, arr) => {
      return val.id === cat
    })
    this._name = this.selectedCategory.name
  }


  deleteCategory(id: string, name: string) {
    swal({
      title: 'Delete Alert',
      text: 'Are you sure about deleting this category?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        firebase.firestore().collection('categories').doc(id).delete().then(del => {
          const current_email = localStorage.getItem('email')
          const current_name = localStorage.getItem('name')
          this.config.logActivity(`${current_name}|${current_email} deleted this category: ${name}`)
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


  async categorySubmitClicked() {
    const name = (<HTMLInputElement>document.getElementById("cat_name")).value;

    if (name === '') {
      return
    }

    const key = firebase.database().ref().push().key
    const current_email = localStorage.getItem('email')
    const current_name = localStorage.getItem('name')
    this.button_pressed = true


    if (!this.editCat) {
      const query = await firebase.firestore().collection('categories').where('name', '==', name).get()
      if (query.size > 0) {
        this.button_pressed = false
        this.config.displayMessage('this particular category exsist already exists', false)
        return
      }
      const category: MainCategory = {
        id: key,
        name: name,
        created_by: `${current_name}|${current_email}`,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }

      firebase.firestore().collection('categories').doc(key).set(category).then(d => {
        this.config.logActivity(`${current_name}|${current_email} created this category: ${name}`)
        this.cancelAddCat()
        this.config.displayMessage('Successfully created', true)
      }).catch(err => {
        this.button_pressed = false
        this.config.displayMessage(`${err}`, false)
      })

    }

    else {
      const category: MainCategory = {
        name: name,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
      }

      firebase.firestore().collection('categories').doc(this.selectedCategory.id).update(category).then(d => {
        this.config.logActivity(`${current_name}|${current_email} updated this category: ${name}`)
        this.cancelAddCat()
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

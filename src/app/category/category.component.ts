import { MainCategory } from './../model/category';
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
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class MyCategoryComponent implements OnInit, OnDestroy {

  public dataTable: DataTable;
  data: string[][] = []
  categories: MainCategory[] = []

  addNewCat = false
  editCat = false
  currentCatRow: any

  selectedCategory: MainCategory

  ngOnDestroy() {

  }
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

  ngOnInit() {
    this.getCategories()
  }

  addCat() {
    this.addNewCat = true
    this.editCat = false
  }

  cancelAddCat() {
    this.addNewCat = false
    this.editCat = false
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


  async deleteCategory(cat: any) {
    const key = ``
    await firebase.firestore().collection('categories').doc(key).delete()
  }


  async categorySubmitClicked() {
    const name = (<HTMLInputElement>document.getElementById("cat_name")).value;

    const key = firebase.database().ref().push().key



    const query = await firebase.firestore().collection('categories').where('name', '==', name).get()
    if (query.size > 0) {
      console.log('this particular category exsist already exists')
      return
    }


    if (!this.editCat) {
      const category: MainCategory = {
        id: key,
        name: name,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }

      firebase.firestore().collection('categories').doc(key).set(category).then(d => {
        this.cancelAddCat()
      }).catch(err => {
        console.log(err);
      })

    }

    else {
      const category: MainCategory = {
        name: name,
        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
      }

      firebase.firestore().collection('categories').doc(this.selectedCategory.id).update(category).then(d => {
        this.cancelAddCat()
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

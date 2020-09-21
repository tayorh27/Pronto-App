import { Component, OnInit } from '@angular/core';
import { TableData } from '../md/md-table/md-table.component';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import * as firebase from "firebase";

declare interface DataTable {
    headerRow: string[];
    footerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-logs-cmp',
    templateUrl: 'logs.component.html',
    styleUrls: ['./logs.component.css']
})

export class LogsComponent implements OnInit {

    public dataTable: DataTable;
    data: string[][] = []

    ngOnInit() {
        this.getLogs()
    }

    constructor(){
        // this.dataTable = {
        //     headerRow: ['ID', 'Log', 'Created Date'],
        //     footerRow: ['ID', 'Log', 'Created Date'],
        //     dataRows: this.data
        // };
    }

    getLogs() {
        firebase.firestore().collection('logs').onSnapshot(query => {
            this.data = []
            var index = 1
            query.forEach(data => {
                const log = data.data()
                this.data.push([`${index}`, log['log'], log['created_date']])
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['ID', 'Log', 'Created Date'],
                footerRow: ['ID', 'Log', 'Created Date'],
                dataRows: this.data
            };
        });
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

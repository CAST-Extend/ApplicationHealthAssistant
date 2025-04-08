import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import DataService from '../../service/data.service';

@Component({
    selector: 'polaris-objselection-dialog',
    templateUrl: './objselection-dialog.component.html',
    styleUrl: './objselection-dialog.component.scss',
})
export class ObjselectionDialogComponent implements OnInit {
    displayedColumns: string[] = ['select', 'id', 'fullName', 'mangling', 'type'];

    dataSourceWithPageSize = new MatTableDataSource<any>();

    dataSource = new MatTableDataSource<ObjectElement>();

    selection = new SelectionModel<ObjectElement>(true, []);

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    spinnerDisplay = false;

    errorDisplay = false;

    /**
     *
     * @param dialogRef
     * @param data
     * @param getObjDetails
     * @param dialog
     * @param dataService
     */
    constructor(
        public dialogRef: MatDialogRef<ObjselectionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public getObjDetails: any,
        public dialog: MatDialog,
        private dataService: DataService
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
    }

    /**
     *
     */
    ngOnInit() {
        this.errorDisplay = false;
        this.spinnerDisplay = true;
        this.dataService.getObjectAgainstIssue(this.getObjDetails).subscribe(
            (response: any) => {
                this.dataSource = new MatTableDataSource<ObjectElement>(response);
                this.dataSource.paginator = this.paginator;

                // disable row logic
                this.dataService.getRetensionObjDetail(this.getObjDetails).subscribe(
                    (responseObjData: any) => {
                        this.spinnerDisplay = false;
                        this.dataSource.data.forEach((row) => {
                            if (
                                responseObjData.retensionObjectDetails[0]?.retensionObjectId?.find(
                                    (obj: any) => obj === row.id
                                )
                            ) {
                                // eslint-disable-next-line no-param-reassign
                                row.excluded = true;
                            }
                        });
                        // preselect rows logic
                        if (this.getObjDetails.rowData.objSelectionStatus) {
                            this.dataSource.data.forEach((row) => {
                                if (
                                    this.getObjDetails.rowData.objList.find(
                                        (obj: any) => obj.id === row.id
                                    )
                                ) {
                                    this.selection.select(row);
                                }
                            });
                        }
                    },
                    () => {
                        this.spinnerDisplay = false;
                    }
                );
            },
            () => {
                this.spinnerDisplay = false;
            }
        );
    }

    /**
     *
     */
    closeDialog() {
        this.dialogRef.close();
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        /* const numRows = this.dataSource.data.length;
        return numSelected === numRows; */
        const numRowsMinusExcluded = this.dataSource.data.filter((row) => !row.excluded).length;

        return numSelected === numRowsMinusExcluded;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        /* this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach((row) => this.selection.select(row)); */
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach((row) => {
                  if (!row.excluded) {
                      this.selection.select(row);
                  }
              });
    }

    /**
     *
     */
    logSelection() {
        /* const objSelection = {
        'issueId': this.data.issueId,
        'objList' : this.selection.selected,
        'selected': this.selection.selected.length > 0
    } */
        if (this.selection.selected.length === 0) {
            this.errorDisplay = true;
        } else {
            this.getObjDetails.rowData.objSelectionStatus = this.selection.selected.length > 0;
            this.getObjDetails.rowData.objList = this.selection.selected;
            this.dialogRef.close();
        }

        // this.selection.selected.forEach(s => console.log(s));
    }
}

export interface ObjectElement {
    id: string;
    fullName: string;
    type: string;
    mangling: string;
    excluded?: boolean;
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { AddDialogComponent } from '../add-dialog/add-dialog.component';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component'
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Issue } from '../models/issue';
import { DataSource } from '@angular/cdk/collections';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HttpClientModule,MatDialogModule, MatPaginatorModule, MatSortModule, MatTableModule, FormsModule, MatDatepickerModule, MatSelectModule,
    ReactiveFormsModule, CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatStepperModule, MatSidenavModule, MatCardModule,RouterLink],
  providers: [DataService,provideNativeDateAdapter()],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  displayedColumns = [
    'id',
    'title',
    'state',
    'url',
    'created_at',
    'updated_at',
    'actions',
  ];
  exampleDatabase: DataService | any;
  dataSource: ExampleDataSource | any;
  index: any;
  id: any;

  date = new FormControl(new Date());
  serializedDate = new FormControl(new Date().toISOString());

  showFiller = true;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  constructor(
    private _formBuilder: FormBuilder,
    public httpClient: HttpClient,
    public dialogService: MatDialog,
    public dataService: DataService
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;

  ngOnInit() {
    this.loadData();
  }

  openAddDialog() {
    const dialogRef = this.dialogService.open(AddDialogComponent, {
      data: { issue: {} },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        this.exampleDatabase.dataChange.value.push(
          this.dataService.getDialogData()
        );
      }
    });
  }
    startEdit(
      i: number,
      id: number,
      title: string,
      state: string,
      url: string,
      created_at: string,
      updated_at: string
    ) {
      this.id = id;
      this.index = i;
      console.log(this.index);
      const dialogRef = this.dialogService.open(EditDialogComponent, {
        data: {
          id: id,
          title: title,
          state: state,
          url: url,
          created_at: created_at,
          updated_at: updated_at,
        },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 1) {
          const foundIndex = this.dataService.dataChange.value.findIndex((x) => x.id === this.id);
          if (foundIndex !== -1) {
            this.dataService.dataChange.value[foundIndex] = this.dataService.getDialogData();
            // Refresh table or perform any other necessary actions
          }
        }
      });
    }

    deleteItem(i: number, id: number, title: string, state: string, url: string) {
      this.index = i;
      this.id = id;
      
      if (this.exampleDatabase !== null) {
        const dialogRef = this.dialogService.open(DeleteDialogComponent, {
          data: { id: id, title: title, state: state, url: url },
        });
    
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 1) {
            const foundIndex = this.exampleDatabase.dataChange.value.findIndex(
              (x:any) => x.id === this.id
            );
            this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
          }
        });
      }
    }

    public loadData() {
      this.exampleDatabase = new DataService(this.httpClient);
      this.dataSource = new ExampleDataSource(
        this.exampleDatabase,
        this.paginator,
        this.sort
      );
      fromEvent(this.filter.nativeElement, 'keyup')
        .subscribe(() => {
          if (!this.dataSource) {
            return;
          }
          this.dataSource.filter = this.filter.nativeElement.value;
        });
    }
  }

export class ExampleDataSource extends DataSource<Issue> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Issue[] = [];
  renderedData: Issue[] = [];

  constructor(
    public _exampleDatabase: DataService,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Issue[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];
  
    this._exampleDatabase.getAllIssues();
  
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this._exampleDatabase.data
          .slice()
          .filter((issue: Issue) => {
            // Check if issue is defined before accessing its properties
            if (!issue) return false;
            const searchStr = (
              (issue.id ?? '') +
              (issue.title ?? '') +
              (issue.url ?? '') +
              (issue.created_at ?? '')
            ).toLowerCase();
            return searchStr.includes(this.filter.toLowerCase());
          });
  
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
  
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this._paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  

  disconnect() {}

  /** Returns a sorted copy of the database data. */
  sortData(data: Issue[]): Issue[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id, b.id];
          break;
        case 'title':
          [propertyA, propertyB] = [a.title, b.title];
          break;
        case 'state':
          [propertyA, propertyB] = [a.state, b.state];
          break;
        case 'url':
          [propertyA, propertyB] = [a.url, b.url];
          break;
        case 'created_at':
          [propertyA, propertyB] = [a.created_at, b.created_at];
          break;
        case 'updated_at':
          [propertyA, propertyB] = [a.updated_at, b.updated_at];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
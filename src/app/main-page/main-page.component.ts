import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import {CheckboxModule} from 'primeng/checkbox';
import {Router} from '@angular/router';
import {PersonsStorage} from "../services/persons-storage";
import {Color, Country, Operation, OperationStatus, OperationType, Person} from "../person.model";
import {DropdownModule} from "primeng/dropdown";
import {Select} from "primeng/select";
import {Tag} from "primeng/tag";
import {InputNumber} from "primeng/inputnumber";
import {Dialog} from 'primeng/dialog';
import {updatePerson} from '../rest/update-persons';
import {savePerson} from '../rest/save-person';
import {deletePerson} from '../rest/delete-person';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {ApiService} from '../services/api.service';
import {FileUpload} from 'primeng/fileupload';

export enum ColumnFilter {
  NONE = "NONE",
  ID = "id",
  NAME = "name",
  COORDINATE_X = "coordinates.x",
  COORDINATE_Y = "coordinates.y",
  EYE_COLOR = "eyeColor",
  HAIR_COLOR = "hairColor",
  LOCATION_X = "location.x",
  LOCATION_Y = "location.y",
  LOCATION_NAME = "location.name",
  HEIGHT = "height",
  WEIGHT = "weight",
  NATIONALITY = "nationality"
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CheckboxModule,
    DropdownModule,
    Select,
    Tag,
    InputNumber,
    Dialog,
    ToastModule,
    FileUpload
  ],
  templateUrl: 'main-page.component.html',
  styleUrl: './main-page.component.scss',
  providers: [MessageService]
})
export class MainPageComponent implements OnInit, AfterViewInit {
  @ViewChild('dt') dt!: Table;

  protected readonly OperationType = OperationType;
  protected readonly OperationStatus = OperationStatus;

  colors = Object.values(Color).map(c => ({label: c, value: c}));
  countries = Object.values(Country).map(c => ({label: c, value: c}));
  filters = Object.values(ColumnFilter).map(c => ({label: c, value: c}));

  totalWeight: number | null = null;
  minEyeColorId: number | null = null;
  weightThreshold: number = 70; // default slider value
  belowWeightCount: number | null = null;
  pendingUpdate: any = null

  dialogInUpdateMode = false
  displayCreateDialog = false;
  displayChooseLocation = false
  displayChooseCoordinates = false
  newPerson = this.getEmptyPerson();
  errorMessageFromServer = ""
  columnFilter = ColumnFilter.NONE
  filterValue = ""
  private username = 'vaskozlov';

  displayOperationsDialog = false;
  operations: Operation[] = [];
  selectedFileName: string | null = null;

  constructor(
    private router: Router,
    public personsStorage: PersonsStorage,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private apiService: ApiService) {
  }

  async ngOnInit() {

  }

  async ngAfterViewInit() {

  }

  getNested(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  applyFilter() {
    if (this.columnFilter === ColumnFilter.NONE) {
      return [...this.personsStorage.persons];
    }
    return [...this.personsStorage.persons].filter(p => {
      const value = this.getNested(p, this.columnFilter);
      return value == this.filterValue;
    });
  }

  onPersonDelete(person: Person) {
    this.finishForm(deletePerson({...person}))
  }

  onNameChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, name: person.name}))
    }
  }

  onCoordinatesChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, coordinates: person.coordinates}))
    }
  }

  onEyeColorChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, eyeColor: person.eyeColor}))
    }

    console.log('Eye color changed:', person.eyeColor);
  }

  onHairColorChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, hairColor: person.hairColor}))
    }

    console.log('Hair color changed:', person.hairColor);
  }

  onLocationChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, location: person.location}))
    }
  }

  onHeightChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, height: person.height}))
    }

    console.log('Height changed:', person.height);
  }

  onWeightChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, weight: person.weight}))
    }

    console.log('Weight changed:', person.weight);
  }

  onNationalityChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, nationality: person.nationality}))
    }

    console.log('Nationality changed:', person.nationality);
  }

  onEditComplete(_: any) {
    if (this.pendingUpdate != null) {
      this.pendingUpdate()
      this.pendingUpdate = null
    }
  }

  calculateTotalWeight() {
    if (!this.personsStorage || !this.personsStorage.persons) {
      this.totalWeight = 0;
      return;
    }
    this.totalWeight = this.personsStorage.persons
      .reduce((sum, person) => sum + (person.weight || 0), 0);
  }

  getMinEyeColor() {
    if (!this.personsStorage?.persons || this.personsStorage.persons.length === 0) {
      this.minEyeColorId = null;
      return;
    }

    // Sort eye colors alphabetically to get the minimum
    const sortedPersons = [...this.personsStorage.persons].sort((a, b) => {
      if (a.eyeColor && b.eyeColor) {
        return a.eyeColor.localeCompare(b.eyeColor);
      }
      return 0;
    });

    // Take the first person with a defined eyeColor
    const minPerson = sortedPersons.find(p => p.eyeColor != null);

    this.minEyeColorId = minPerson?.id ?? null;
  }

  getBelowWeight() {
    if (!this.personsStorage?.persons || this.personsStorage.persons.length === 0) {
      this.belowWeightCount = 0;
      return;
    }

    this.belowWeightCount = this.personsStorage.persons.filter(
      person => person.weight != null && person.weight < this.weightThreshold
    ).length;
  }

  showCreateDialog() {
    this.newPerson = this.getEmptyPerson(); // reset form
    this.displayCreateDialog = true;
    this.dialogInUpdateMode = false
  }

  onLocationSelected(personToCopyLocation: Person) {
    // @ts-ignore
    this.newPerson.location = personToCopyLocation.location!
    this.displayChooseLocation = false
  }

  onCoordinatesSelected(personToCopyLocation: Person) {
    // @ts-ignore
    this.newPerson.coordinates = personToCopyLocation.coordinates!
    this.displayChooseCoordinates = false
  }

  getEmptyPerson() {
    return {
      id: null,
      name: '',
      coordinates: {id: null, x: 0, y: 0},
      creationTime: null,
      eyeColor: Color.BROWN,
      hairColor: Color.BLUE,
      location: {id: null, x: 0, y: 0, name: ''},
      height: 0,
      weight: 0,
      nationality: Country.GERMANY
    };
  }

  generateNewId(): number {
    const ids = this.personsStorage.persons.map(p => p.id).filter(v => v != null);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  isCreateFormValid(): boolean {
    return !!this.newPerson.name && !!this.newPerson.eyeColor;
  }

  getReasonForInvalidForm(): string | null {
    if (this.newPerson.name == null || this.newPerson.name.length === 0) {
      return "Name can not be blank";
    }

    if (this.newPerson.coordinates.x == null) {
      return "x coordinate must be set"
    }

    if (this.newPerson.coordinates.y == null) {
      return "y coordinate must be set"
    }

    if (this.newPerson.coordinates.x < -367) {
      return "x coordinate can not be below -367"
    }

    if (this.newPerson.coordinates.y > 944) {
      return "y coordinate can not be above 944"
    }

    if (this.newPerson.location.name.length > 409) {
      return "Location name too long"
    }

    if (this.newPerson.coordinates.x < 0 || this.newPerson.coordinates.x >= 360) {
      return "Coordinate.x must be between 0 and 360";
    }

    if (this.newPerson.coordinates.y < 0 || this.newPerson.coordinates.y >= 180) {
      return "Coordinate.y must be between 0 and 180";
    }

    if (this.newPerson.height == null || this.newPerson.height <= 0) {
      return "Height must be positive"
    }

    if (this.newPerson.weight == null || this.newPerson.weight <= 0) {
      return "Weight must be positive"
    }

    return null
  }

  createPerson() {
    const person = {...this.newPerson}

    if (this.dialogInUpdateMode) {
      this.finishForm(updatePerson(person))
    } else {
      this.finishForm(savePerson(person))
    }
  }

  finishForm(result: Promise<Response>) {
    result.then(async r => {
      if (r.ok) {
        this.displayCreateDialog = false;
        this.dialogInUpdateMode = false
      } else {
        this.personsStorage.fullUpdate()
        this.errorMessageFromServer = await r.text()
      }
    }).catch(e => {
      this.personsStorage.fullUpdate()
      this.errorMessageFromServer = e.value
    })
  }

  showSuccessNotification(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 5000
    });
  }

  showErrorNotification(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  async showOperations() {
    try {
      this.operations = await this.apiService.getOperations('vaskozlov');
      this.displayOperationsDialog = true;
    } catch (error) {
      this.showErrorNotification('Failed to load operations');
      console.error(error);
    }
  }

  downloadFile(objectName: string | undefined) {
    if (!objectName) {
      return;
    }

    this.apiService.downloadFile(objectName).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = objectName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Download failed', error);
      this.showErrorNotification('Failed to download file');
    });
  }

  async onFileSelected(event: any) {
    if (!event?.files?.length) return;

    const file: File = event.files[0];
    this.selectedFileName = file.name;

    try {
      const content = await this.readFileContent(file);  // Get CSV as string
      const validationResult = await this.validateCsv(file);  // Still validate using file, but could use content
      if (!validationResult.valid) {
        this.showErrorNotification(`Validation failed: ${validationResult.errors.join(', ')}`);
        this.selectedFileName = null;
        return;
      }

      await this.apiService.uploadCsvFile(content, this.username);
      this.showSuccessNotification('File uploaded successfully');
      this.personsStorage.fullUpdate();
    } catch (error) {
      this.showErrorNotification('Failed to upload file');
      console.error(error);
    } finally {
      this.selectedFileName = null;
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private parseCsv(content: string): { headers: string[]; rows: string[][]; separator: string } {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 1) {
      throw new Error('Empty CSV');
    }

    const firstLine = lines[0];
    let separator = ',';
    const commaSplits = firstLine.split(',').length;
    const semiSplits = firstLine.split(';').length;
    if (semiSplits > commaSplits) {
      separator = ';';
    }

    const headers = firstLine.split(separator).map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(separator).map(cell => cell.trim()));

    return {headers, rows, separator};
  }

  private validateHeaders(headers: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredHeaders = [
      'name',
      'coordinates_x',
      'coordinates_y',
      'eyeColor',
      'hairColor',
      'height',
      'weight',
      'location_x',
      'location_y',
      'location_name'
    ];  // Removed 'nationality' as it's optional

    for (const req of requiredHeaders) {
      if (!headers.includes(req)) {
        errors.push(`Missing header: ${req}`);
      }
    }

    return {valid: errors.length === 0, errors};
  }

  private validateRows(rows: string[][], headers: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const colorValues = Object.values(Color);
    const countryValues = Object.values(Country);

    const hasCoordId = headers.includes('coordinates_id');
    const hasLocId = headers.includes('location_id');
    const hasNationality = headers.includes('nationality');

    rows.forEach((row, index) => {
      if (row.length !== headers.length) {
        errors.push(`Row ${index + 1} has incorrect number of columns`);
        return;  // Skip further validation for this row
      }

      const rowMap: { [key: string]: string } = {};
      headers.forEach((header, colIndex) => {
        rowMap[header] = row[colIndex];
      });

      // Validate name
      if (!rowMap['name'] || rowMap['name'].trim() === '') {
        errors.push(`Row ${index + 1}: Name cannot be blank`);
      }

      // Validate coordinates_x (if required)
      const coordX = parseInt(rowMap['coordinates_x'], 10);
      if (isNaN(coordX) || coordX < -367) {
        errors.push(`Row ${index + 1}: Invalid coordinates_x (must be integer >= -367)`);
      }

      // Validate coordinates_y
      const coordY = parseFloat(rowMap['coordinates_y']);
      if (isNaN(coordY) || coordY > 944) {
        errors.push(`Row ${index + 1}: Invalid coordinates_y (must be float <= 944)`);
      }

      // Validate coordinates_id if present
      if (hasCoordId) {
        const coordIdStr = rowMap['coordinates_id'];
        if (coordIdStr && isNaN(parseInt(coordIdStr, 10))) {
          errors.push(`Row ${index + 1}: Invalid coordinates_id (must be integer or empty)`);
        }
      }

      // Validate eyeColor
      if (!colorValues.includes(rowMap['eyeColor'].toUpperCase() as Color)) {
        errors.push(`Row ${index + 1}: Invalid eyeColor (must be one of: ${colorValues.join(', ')})`);
      }

      // Validate hairColor
      if (!colorValues.includes(rowMap['hairColor'].toUpperCase() as Color)) {
        errors.push(`Row ${index + 1}: Invalid hairColor (must be one of: ${colorValues.join(', ')})`);
      }

      // Validate nationality if present and not empty
      if (hasNationality && rowMap['nationality'] && !countryValues.includes(rowMap['nationality'].toUpperCase() as Country)) {
        errors.push(`Row ${index + 1}: Invalid nationality (must be one of: ${countryValues.join(', ')})`);
      }

      // Validate height
      const height = parseFloat(rowMap['height']);
      if (isNaN(height) || height <= 0) {
        errors.push(`Row ${index + 1}: Invalid height (must be positive number)`);
      }

      // Validate weight
      const weight = parseFloat(rowMap['weight']);
      if (isNaN(weight) || weight <= 0) {
        errors.push(`Row ${index + 1}: Invalid weight (must be positive number)`);
      }

      // Validate location_x
      const locX = parseFloat(rowMap['location_x']);
      if (isNaN(locX) || locX < 0 || locX >= 360) {
        errors.push(`Row ${index + 1}: Invalid location_x (must be between 0 and 360)`);
      }

      // Validate location_y
      const locY = parseFloat(rowMap['location_y']);
      if (isNaN(locY) || locY < 0 || locY >= 180) {
        errors.push(`Row ${index + 1}: Invalid location_y (must be between 0 and 180)`);
      }

      // Validate location_id if present
      if (hasLocId) {
        const locIdStr = rowMap['location_id'];
        if (locIdStr && isNaN(parseInt(locIdStr, 10))) {
          errors.push(`Row ${index + 1}: Invalid location_id (must be integer or empty)`);
        }
      }

      // Validate location_name
      if (rowMap['location_name'].length > 409) {
        errors.push(`Row ${index + 1}: Location name too long (max 409 characters)`);
      }
    });

    return {valid: errors.length === 0, errors};
  }

  private async validateCsv(file: File): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const content = await this.readFileContent(file);
      const {headers, rows} = this.parseCsv(content);  // separator not needed further

      const headerValidation = this.validateHeaders(headers);
      if (!headerValidation.valid) {
        return headerValidation;
      }

      const rowsValidation = this.validateRows(rows, headers);
      if (!rowsValidation.valid) {
        return rowsValidation;
      }

      return {valid: true, errors: []};
    } catch (error) {
      return {valid: false, errors: ['Failed to process CSV file']};
    }
  }
}

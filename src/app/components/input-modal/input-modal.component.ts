import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Modal } from '../modal';
import { AbstractControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-input-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatAutocompleteModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './input-modal.component.html',
  styleUrl: './input-modal.component.css',
})
export class InputModalComponent {
  constructor(
    public dialogRef: MatDialogRef<InputModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {}
  allElementsData!: Modal[];
  displayform!: FormGroup;
  newgroup: any[] = [];
  newgroupcheck: any[] = [];
  validationform!: FormGroup;
  radiopresent: boolean = false;
  checkpresent: boolean = false;
  headerlist: string[] = [
    'Display',
    
    'Validation',
   
  ];
  selectedHeader: string = 'Display';
  setSelectedHeader(data: string) {
    this.selectedHeader = data;
  }
  isFormValid(): boolean {
    if (this.data.selectedfield === 'Radio Button') {
      return (
        this.groupradio.length > 0 &&
        this.groupradio.controls.every(
          (control) => control.get('radioid')?.valid
        )
      );
    } else if (this.data.selectedfield === 'Checkbox') {
      return (
        this.groupcheck.length > 0 &&
        this.groupcheck.controls.every(
          (control) => control.get('checkid')?.valid
        )
      );
    } else {
      return this.displayform.get('id')?.valid ?? false;
    }
  }
  fontSizeValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.replace('px', '');
      if (isNaN(value)) {
        return { invalidFormat: true };
      }
      const numValue = parseFloat(value);
      if (numValue < 0.5) {
        return { belowMin: true };
      }
      if (numValue > 40) {
        return { aboveMax: true };
      }
      return null;
    };
  }
  
  formatFontSize(event: any) {
    const input = event.target;
    let value = input.value;
    
    // Remove any alphabetic characters except 'px' at the end
    value = value.replace(/[a-zA-Z]/g, '').replace(/px$/i, '');
    
    // Don't update if empty
    if (value === '') {
      this.displayform.patchValue({
        fontSize: ''
      });
      return;
    }
  
    // Parse the numeric value and append px
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Get cursor position before update
      const cursorPos = input.selectionStart;
      
      // Update the form value
      this.displayform.patchValue({
        fontSize: numValue + 'px'
      });
  
      // Wait for the next tick to set cursor position
      setTimeout(() => {
        // If cursor was at the end, place it before 'px'
        if (cursorPos === input.value.length - 2) {
          input.setSelectionRange(input.value.length - 2, input.value.length - 2);
        } else {
          // Otherwise maintain the cursor position
          input.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }
  }
  
  onFontSizeKeyPress(event: KeyboardEvent): boolean {
    // Allow numbers, decimal point, backspace, delete, arrow keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.'];
    if (allowedKeys.includes(event.key) || /^\d$/.test(event.key)) {
      return true;
    }
    return false;
  }
  doAction(event: string) {
    this.newgroup.forEach((radio: any) => {
      const radioForm = this.fb.group({
        radioid: [radio.value.radioid, Validators.required],
        label: [radio.value.label || ''],
      });

      this.groupradio.push(radioForm);
    });
    this.newgroupcheck.forEach((check: any) => {
      const checkFormForm = this.fb.group({
        checkid: [check.value.checkid, Validators.required],
        checklabel: [check.value.checklabel || ''],
      });

      this.groupcheck.push(checkFormForm);
    });
    this.dialogRef.close({
      status: event,
      display: {
        ...this.displayform.value,
        selectOptions: this.selectOptions.value
      },
      validation: this.validationform.value,
    });
  }
  get id() {
    return this.displayform.get('id');
  }
  get groupradio() {
    return this.displayform.get('groupradio') as FormArray;
  }
  get groupcheck() {
    return this.displayform.get('groupcheck') as FormArray;
  }
  get selectOptions() {
    return this.displayform.get('selectOptions') as FormArray;
  }
  addRadio() {
    const radioform = this.fb.group({
      radioid: [
        '',
        [Validators.required, Validators.minLength(3), this.noSpaceValidator()],
      ],
      label: [''],
    });
    this.groupradio.push(radioform);
  }
  addCheck() {
    const checkform = this.fb.group({
      checkid: [
        '',
        [Validators.required, Validators.minLength(3), this.noSpaceValidator()],
      ],
      checklabel: [''],
    });
    this.groupcheck.push(checkform);
  }
  changeId(val: string) {
    this.displayform.patchValue({
      id: val,
    });
  }

  deleteradio(lessonIndex: number) {
    this.groupradio.removeAt(lessonIndex);
  }
  deletecheck(lessonIndex: number) {
    this.groupcheck.removeAt(lessonIndex);
  }
  ngOnInit() {
    this.displayform = this.fb.group({
      placeholder: [''],
      groupname: [''],
      groupradio: this.fb.array([]),
      groupcheck: this.fb.array([]),
      selectOptions: this.fb.array([]),
      id: [
        '',
        [Validators.required, Validators.minLength(3), this.noSpaceValidator()],
      ],
      fontSize: ['16px', [this.fontSizeValidator()]],
    });
    this.validationform = this.fb.group({
      minlength: [],
      maxlength: [],
    });
    if (this.data.current_element_data) {
      const data = this.data.current_element_data;
      const fontSize = this.data.current_element_data.fontSize || '16px';

      this.displayform.patchValue({
        placeholder: data.placeholder || '',
        groupname: data.groupname || '',
        id: data.id,
        fontSize: fontSize.replace(/[^\d.]/g, '') + 'px'
      });
      this.validationform.patchValue({
        minlength: data.minlength || [],
        maxlength: data.maxlength || [],
      });
      if (data.selectOptions && data.selectOptions.length > 0) {
        this.patchSelectOptions(data.selectOptions);
      }
      if (data.groupradio && data.groupradio.length > 0) {
        this.radiopresent = true;
        this.patchGroupRadio(data.groupradio, data.id);
      }
      if (data.groupcheck && data.groupcheck.length > 0) {
        this.checkpresent = true;
        this.patchGroupCheck(data.groupcheck, data.id);
      }
    }
    if (this.data.all_elements) {
      this.allElementsData = Array.from(this.data.all_elements.values());
      this.displayform
        .get('id')
        ?.addValidators(
          Validateid(this.data.all_elements, this.data.current_element_id)
        );
    }
  }

  addSelectOption() {
    const optionForm = this.fb.group({
      data: ['', Validators.required],
      value: ['', Validators.required]
    });
    this.selectOptions.push(optionForm);
  }

  // Method to delete a select option
  deleteSelectOption(index: number) {
    this.selectOptions.removeAt(index);
  }

  // Method to patch existing select options
  patchSelectOptions(options: Array<{ data: string; value: string }>) {
    options.forEach(option => {
      const optionForm = this.fb.group({
        data: [option.data, Validators.required],
        value: [option.value, Validators.required]
      });
      this.selectOptions.push(optionForm);
    });
  }
  getFontSizeValue(): number {
    const fontSize = this.displayform.get('fontSize')?.value;
    return parseFloat(fontSize) || 16; // Default to 16 if parsing fails
  }
  updateFontSize(event: any) {
    const fontSize = event.target.value;
    this.displayform.patchValue({ fontSize });
  }
  noSpaceValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && control.value.includes(' ')) {
        return { containsSpace: true };
      }
      return null;
    };
  }
  patchGroupRadio(groupradioData: any[], id: string) {
    groupradioData.forEach((radio: any) => {
      const radioForm = this.fb.group({
        radioid: [radio.radioid, Validators.required],
        label: [radio.label || ''],
      });
      if (radio.radioid == id) {
        this.groupradio.push(radioForm);
      } else {
        this.newgroup.push(radioForm);
      }
    });
  }
  patchGroupCheck(groupcheckData: any[], id: string) {
    groupcheckData.forEach((check: any) => {
      const checkForm = this.fb.group({
        checkid: [check.checkid, Validators.required],
        checklabel: [check.checklabel || ''],
      });
      if (check.checkid == id) {
        this.groupcheck.push(checkForm);
      } else {
        this.newgroupcheck.push(checkForm);
      }
    });
  }
}
export function Validateid(
  all_elements: Map<string, Modal>,
  current_element_id: any
) {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const controlValue = control.value;

    for (let [key, modal] of all_elements) {
      if (modal.id === controlValue && key != current_element_id) {
        return { idExists: false };
      }
    }

    return null;
  };
}

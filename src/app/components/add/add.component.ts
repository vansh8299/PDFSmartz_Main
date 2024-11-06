import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgClass } from '@angular/common';
import { DataService } from '../../services/data.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormioModule } from '@formio/angular';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InputModalComponent } from '../input-modal/input-modal.component';
import { Modal } from '../modal';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  NavigationExtras,
  Router,
  RouterModule,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
// import * as pdfjsLib from 'pdfjs-dist';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    NgClass,
    PdfViewerModule,
    FormioModule,
    RouterModule,
    FormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css',
})
export class AddComponent implements AfterViewInit {
  formTitle: string = '';
  formName: string = '';
  constructor(
    private snackBar: MatSnackBar,
    private data: DataService,
    private router: Router
  ) {
    this.pdfHtml = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    this.filename =
      this.router.getCurrentNavigation()?.extras?.state?.['filename'];
  }

  modalDataMap: Map<string, Modal> = new Map();
  clicked: boolean = false;
  url!: string;
  pdfHtml!: string;
  filename!: string;
  showfields: boolean = false;
  formTypes: string[] = ['Assessment Form', 'Client Form', 'Caregiver Form'];
  selectedFormType: string | undefined = '';
  showToast: boolean = false;
  toastMessage: string = '';
  isError: boolean = false;
  readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.getpdfdata();
  }

  allfields = [
    { icon: 'fa fa-keyboard', name: 'TextField' },
    { icon: 'fa fa-font', name: 'TextArea' },
    { icon: 'fa fa-envelope', name: 'Email' },
    { icon: 'fa-solid fa-hashtag', name: 'Number' },
    { icon: 'fa fa-phone-square', name: 'Phone Number' },
    { icon: 'fa fa-calendar', name: 'Date/Time' },
    { icon: 'fa fa-pencil', name: 'Signature' },
    { icon: 'fa fa-circle', name: 'Radio Button' },
    { icon: 'fa fa-check-square', name: 'Checkbox' },
    { icon: 'fa fa-caret-down', name: 'Select' },
  ];

  // field() {
  //   this.clicked = true;
  //   this.showfields = !this.showfields;
  // }

  getpdfdata() {
    if (this.pdfHtml) {
      // Set the srcdoc of the iframe to the retrieved HTML content
      this.iframeElement.nativeElement.srcdoc = this.pdfHtml;
      console.log('PDF HTML loaded into iframe.');
    } else {
      console.error('Error in Uploading PDF.');
      // Optionally reload or retry logic if needed
    }
  }

  @ViewChild('iframeElement', { static: true }) iframeElement!: ElementRef;

  ngAfterViewInit() {
    const iframe = this.iframeElement.nativeElement;

    iframe.onload = () => {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const newdiv = iframeDocument.createElement('div') as HTMLElement;
      newdiv.classList.add('all-inputs');
      iframeDocument.body.appendChild(newdiv);
      const watermark = iframeDocument.querySelector('.stl_01');
      if (watermark) {
        watermark.style.display = 'none';
      }

      iframeDocument.body.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'copy';
      });
      iframeDocument.body.addEventListener('drop', (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer?.getData('text/plain').startsWith('new:')) {
          this.openDialog(event, iframeDocument, '');
        }
      });
    };

    // this.initializeForm();
  }

  openDialog(event: DragEvent, iframeDocument: Document, elementId?: string) {
    let currentElementId: string;

    if (elementId) {
      currentElementId = elementId;
    } else {
      currentElementId = `input-container-${Date.now()}`;
    }
    let currentModalData = this.modalDataMap.get(
      elementId || currentElementId
    ) || {
      placeholder: '',
      minlength: null,
      maxlength: null,
      groupname: null,
      groupradio: null,
      groupcheck: null,
      selectOptions: [],
      id: '',
      fontSize: '16px',
    };
    const newevent = {
      dataTransfer: {
        text: (event as DragEvent).dataTransfer?.getData('text/plain'),
        xval: (event as DragEvent).dataTransfer?.getData('xval'),
        yval: (event as DragEvent).dataTransfer?.getData('yval'),
      },
      clientX: event.clientX,
      clientY: event.clientY,
    };

    const dialogRef = this.dialog.open(InputModalComponent, {
      height: '90vh',
      data: {
        selectedfield: `${
          event.dataTransfer?.getData('text/plain').split(':')[1]
        }`,
        all_elements: this.modalDataMap,
        current_element_data: currentModalData,
        current_element_id: currentElementId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.status == 'Save') {
        if (result.display) {
          if (result.display.placeholder != '') {
            currentModalData.placeholder = result.display.placeholder || '';
          }
          if (result.display.groupname != '') {
            currentModalData.groupname = result.display.groupname || '';
          }
          if (result.display.id != '') {
            currentModalData.id = result.display.id || '';
          }
          if (result.display.fontSize != '') {
            currentModalData.fontSize = result.display.fontSize || '16px';
          }
          if (result.display.groupradio.length > 0) {
            currentModalData.groupradio = result.display.groupradio;
          }
          if (result.display.groupcheck.length > 0) {
            currentModalData.groupcheck = result.display.groupcheck;
          }
          if (result.display.selectOptions?.length > 0) {
            currentModalData.selectOptions = result.display.selectOptions;
          }
        }
        if (result.validation) {
          console.log(result.validation);
          if (result.validation.minlength) {
            currentModalData.minlength = result.validation.minlength || null;
          }
          if (result.validation.maxlength) {
            currentModalData.maxlength = result.validation.maxlength || null;
          }
        }

        if (newevent.dataTransfer.text?.substring(4) == 'Radio Button') {
          currentModalData.groupradio.map((d: any, index: any) => {
            currentElementId = `input-container-${Date.now()}-${index}`;
            let newModalData = JSON.parse(JSON.stringify(currentModalData));

            newModalData.id = d.radioid;

            this.modalDataMap.set(currentElementId, newModalData);

            newevent.dataTransfer.yval = (
              Number(newevent.dataTransfer.yval) + 20
            ).toString();
            console.log(currentElementId);
            this.onDrop(newevent, iframeDocument, currentElementId, index);
          });
        } else if (newevent.dataTransfer.text?.substring(4) == 'Checkbox') {
          currentModalData.groupcheck.map((d: any, index: any) => {
            currentElementId = `input-container-${Date.now()}-${index}`;
            let newModalData = JSON.parse(JSON.stringify(currentModalData));

            newModalData.id = d.checkid;

            this.modalDataMap.set(currentElementId, newModalData);

            newevent.dataTransfer.yval = (
              Number(newevent.dataTransfer.yval) + 20
            ).toString();
            console.log(currentElementId);
            this.onDrop(newevent, iframeDocument, currentElementId, index);
          });
        } else {
          this.modalDataMap.set(currentElementId, currentModalData);
          this.onDrop(newevent, iframeDocument, currentElementId, '');
        }
      }
    });
  }

  onDragStart(event: DragEvent, elementType: string) {
    const targetElement = event.target as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    event.dataTransfer?.setData('xval', (event.clientX - 35).toString());
    event.dataTransfer?.setData('yval', (event.clientY - rect.top).toString());
    event.dataTransfer?.setData('text/plain', 'new:' + elementType);
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDrop(
    event: any,
    iframeDocument: Document,
    currentElementId: string,
    index: any
  ) {
    console.log(index);

    // event.preventDefault();
    const data = event.dataTransfer?.text;
    if (!data) return;
    const xval = Number(event.dataTransfer?.xval);
    const yval = Number(event.dataTransfer?.yval);
    const rect = iframeDocument.body.getBoundingClientRect();

    const scrollLeft =
      iframeDocument.documentElement.scrollLeft ||
      iframeDocument.body.scrollLeft;
    // const scrollTop =
    //   iframeDocument.documentElement.scrollTop || iframeDocument.body.scrollTop;
    // console.log(scrollTop);
    const x = event.clientX - rect.left + scrollLeft - xval;
    const y = event.clientY - rect.top - yval;
    console.log(y);
    if (data.startsWith('new:')) {
      const type = data.substring(4); // Remove 'new:' prefix
      this.createDraggableInput(
        iframeDocument,
        type,
        x,
        y,
        currentElementId,
        index
      );
    } else {
      // This is an existing element being moved
      const draggedElement = iframeDocument.getElementById(data);
      if (draggedElement) {
        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;
      }
    }
  }

  createDraggableInput(
    iframeDocument: Document,
    type: string,
    x: number,
    y: number,
    currentElementId: string,
    index: any
  ) {
    const container = iframeDocument.createElement('div');
    container.style.position = 'absolute';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    container.style.width = '150px'; // Default size
    // container.style.height = '20px';
    // Disable native resizable functionality
    container.style.resize = 'none';

    // Add custom border for better UI

    container.style.minWidth = '20px';
    container.style.minHeight = '10px';
    // container.style.overflow = 'auto';
    container.style.boxSizing = 'border-box';
    container.setAttribute('draggable', 'true');
    container.id = currentElementId;

    // Create four corner resize handles
    if (type !== 'TextArea' && type !== 'Signature') {
      container.addEventListener('mousemove', () => {
        container.style.border = '2px dotted #2176cb';
        const corners = [
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ];
        corners.forEach((corner) => {
          const handle = iframeDocument.createElement('div');
          handle.classList.add('resize-handle', corner); // Assign a class to identify each corner handle
          handle.style.position = 'absolute';
          handle.style.width = '5px';
          handle.style.height = '5px';
          handle.style.backgroundColor = '#2176cb';
          handle.style.zIndex = '10';
          // Set positions for each corner
          if (corner.includes('top')) {
            handle.style.top = '0';
          } else {
            handle.style.bottom = '0';
          }
          if (corner.includes('left')) {
            handle.style.left = '0';
          } else {
            handle.style.right = '0';
          }

          handle.style.cursor = `${corner}-resize`;
          container.appendChild(handle);
          container.addEventListener('mouseleave', () => {
            container.style.border = 'none';

            if (container.contains(handle)) {
              container.removeChild(handle);
            }
          });
          // Add event listener to handle resizing
          handle.addEventListener('mousedown', (event: MouseEvent) =>
            this.startResizing(event, container, corner, iframeDocument)
          );
        });
      });
    }

    let divError = iframeDocument.createElement('div');
    divError.style.cssText = ` font-size: .8em;
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
  text-align: center;
  width: 100%;
  margin-top: -4px;
  padding: 5px 1px;`;
    let modalData = this.modalDataMap.get(currentElementId);
    switch (type) {
      case 'Email': {
        const emailElement = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        emailElement.setAttribute('type', 'email');
        emailElement.setAttribute('readonly', 'true');
        emailElement.placeholder = modalData?.placeholder || '';
        emailElement.style.width = '100%'; // Fill container's width
        emailElement.style.height = '100%'; // Fill container's height
        emailElement.style.padding = '4px';
        emailElement.style.outline = 'none';
        emailElement.style.border = 'none';
        emailElement.style.backgroundColor = '#fbdeb8';
        emailElement.style.boxSizing = 'border-box'; // Adjust for padding/border
        emailElement.style.resize = 'none'; // Disable resizing for input directly
        // container.dataset['placeholder'] = placeholderValue;
        emailElement.setAttribute('id', modalData?.id || '');
        emailElement.style.fontSize = modalData?.fontSize || '16px';
        emailElement.addEventListener('input', (val) => {
          modalData = this.modalDataMap.get(currentElementId);
          const data = val.target as HTMLInputElement;
          this.checkvalidation(data, modalData, container, divError);
          emailElement.setAttribute('value', data.value);
        });
        container.appendChild(emailElement);
        break;
      }

      case 'Number': {
        const numberElement = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        numberElement.setAttribute('type', 'number');
        numberElement.setAttribute('readonly', 'true');
        numberElement.placeholder = modalData?.placeholder || '';
        numberElement.style.width = '100%'; // Fill container's width
        numberElement.style.height = '100%'; // Fill container's height
        numberElement.style.padding = '4px';
        numberElement.style.outline = 'none';
        numberElement.style.border = 'none';
        numberElement.style.backgroundColor = '#fbdeb8';
        numberElement.style.boxSizing = 'border-box'; // Adjust for padding/border
        numberElement.style.resize = 'none'; // Disable resizing for input directly
        numberElement.style.fontSize = modalData?.fontSize || '16px';
        numberElement.setAttribute('id', modalData?.id || '');
        numberElement.addEventListener('input', (val) => {
          modalData = this.modalDataMap.get(currentElementId);
          const data = val.target as HTMLInputElement;
          if (modalData?.minlength && modalData?.maxlength) {
            if (data.value.toString().length > modalData.maxlength) {
              divError.innerHTML = `It must have no more than ${modalData.maxlength} character`;
              container.appendChild(divError);
            } else if (data.value.toString().length < modalData.minlength) {
              divError.innerHTML = `It must have at least ${modalData?.minlength} character`;
              container.appendChild(divError);
            } else {
              divError.innerHTML = '';
              if (container.childNodes.length == 2) {
                container.removeChild(divError);
              }
            }
          } else if (modalData?.maxlength) {
            if (data.value.toString().length > modalData?.maxlength) {
              divError.innerHTML = `It must have no more than ${modalData?.maxlength} character`;
              container.appendChild(divError);
            } else {
              divError.innerHTML = '';
              if (container.childNodes.length == 2) {
                container.removeChild(divError);
              }
            }
          } else if (modalData?.minlength) {
            if (data.value.toString().length < modalData?.minlength) {
              divError.innerHTML = `It must have at least ${modalData?.minlength} character`;
              container.appendChild(divError);
            } else {
              divError.innerHTML = '';
              if (container.childNodes.length == 2) {
                container.removeChild(divError);
              }
            }
          }

          numberElement.setAttribute('value', data.value);
        });
        // container.dataset['placeholder'] = placeholderValue;

        container.appendChild(numberElement);
        break;
      }

      case 'TextField': {
        const inputElement = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('readonly', 'true');
        inputElement.style.width = '100%'; // Fill container's width
        inputElement.style.height = '100%'; // Fill container's height
        inputElement.style.padding = '4px';
        inputElement.style.outline = 'none';
        inputElement.style.border = 'none';
        inputElement.style.backgroundColor = '#fbdeb8';
        inputElement.style.boxSizing = 'border-box'; // Adjust for padding/border
        inputElement.style.resize = 'none'; // Disable resizing for input directly
        inputElement.setAttribute('id', modalData?.id || '');
        inputElement.style.fontSize = modalData?.fontSize || '16px';
        // container.dataset['placeholder'] = placeholderValue;
        inputElement.placeholder = modalData?.placeholder || '';
        inputElement.addEventListener('input', (val) => {
          const data = val.target as HTMLInputElement;
          modalData = this.modalDataMap.get(currentElementId);
          this.checkvalidation(data, modalData, container, divError);
          inputElement.setAttribute('value', data.value);
        });
        container.appendChild(inputElement);
        break;
      }
      case 'SelectField': {
        const selectElement = iframeDocument.createElement(
          'select'
        ) as HTMLSelectElement;

        // Set basic attributes
        selectElement.setAttribute('id', modalData?.id || '');
        selectElement.setAttribute('readonly', 'true');

        // Apply similar styling
        selectElement.style.width = '100%';
        selectElement.style.height = '100%';
        selectElement.style.padding = '4px';
        selectElement.style.outline = 'none';
        selectElement.style.border = 'none';
        selectElement.style.backgroundColor = '#fbdeb8';
        selectElement.style.boxSizing = 'border-box';
        selectElement.style.fontSize = modalData?.fontSize || '16px';

        // Add options from modalData
        if (modalData) {
          // Add default/placeholder option if specified
          if (modalData.placeholder) {
            const placeholderOption = iframeDocument.createElement('option');
            placeholderOption.value = '';
            placeholderOption.text = modalData.placeholder;
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            selectElement.appendChild(placeholderOption);
          }

          // Add all other options
        }

        // Add change event listener
        selectElement.addEventListener('change', (event) => {
          const data = event.target as HTMLSelectElement;
          modalData = this.modalDataMap.get(currentElementId);
          this.checkvalidation(data, modalData, container, divError);
          selectElement.setAttribute('value', data.value);
        });

        container.appendChild(selectElement);
        break;
      }
      case 'Phone Number': {
        const phoneElement = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        phoneElement.setAttribute('type', 'tel');
        phoneElement.setAttribute('readonly', 'true');
        phoneElement.placeholder = modalData?.placeholder || '';
        phoneElement.style.width = '100%'; // Fill container's width
        phoneElement.style.height = '100%'; // Fill container's height
        phoneElement.style.padding = '4px';
        phoneElement.style.outline = 'none';
        phoneElement.style.border = 'none';
        phoneElement.style.backgroundColor = '#fbdeb8';
        phoneElement.style.boxSizing = 'border-box'; // Adjust for padding/border
        phoneElement.style.resize = 'none'; // Disable resizing for input directly
        phoneElement.setAttribute('id', modalData?.id || '');
        phoneElement.style.fontSize = modalData?.fontSize || '16px';
        // container.dataset['placeholder'] = placeholderValue;
        phoneElement.addEventListener('input', (val) => {
          const data = val.target as HTMLInputElement;
          modalData = this.modalDataMap.get(currentElementId);
          if (modalData?.minlength && modalData?.maxlength) {
            if (data.value.toString().length > modalData.maxlength) {
              divError.innerHTML = `It must have no more than ${modalData.maxlength} character`;
              container.appendChild(divError);
            } else if (data.value.toString().length < modalData.minlength) {
              divError.innerHTML = `It must have at least ${modalData?.minlength} character`;
              container.appendChild(divError);
            } else {
              divError.innerHTML = '';
              if (container.childNodes.length == 2) {
                container.removeChild(divError);
              }
            }
          } else if (modalData?.maxlength) {
            if (data.value.toString().length > modalData?.maxlength) {
              divError.innerHTML = `It must have no more than ${modalData?.maxlength} character`;
              container.appendChild(divError);
            } else {
              divError.innerHTML = '';
              if (container.childNodes.length == 2) {
                container.removeChild(divError);
              }
            }
          } else if (modalData?.minlength) {
            if (data.value.toString().length < modalData?.minlength) {
              divError.innerHTML = `It must have at least ${modalData?.minlength} character`;
              container.appendChild(divError);
            } else {
              divError.innerHTML = '';
              if (container.childNodes.length == 2) {
                container.removeChild(divError);
              }
            }
          }

          phoneElement.setAttribute('value', data.value);
        });
        container.appendChild(phoneElement);
        break;
      }

      case 'TextArea': {
        const textAreaInput = iframeDocument.createElement(
          'textarea'
        ) as HTMLTextAreaElement;
        textAreaInput.setAttribute('type', 'text'); // solve number error
        textAreaInput.setAttribute('readonly', 'true');
        textAreaInput.style.width = '100%';
        textAreaInput.style.height = '100%';
        textAreaInput.style.padding = '4px';
        textAreaInput.style.outline = 'none';
        textAreaInput.style.border = 'none';
        textAreaInput.style.backgroundColor = '#fbdeb8';
        textAreaInput.style.boxSizing = 'border-box'; // Adjust for padding/border
        // Removed resize property for textarea as it already has its own resizable functionality
        textAreaInput.setAttribute('id', modalData?.id || '');
        textAreaInput.style.fontSize = modalData?.fontSize || '16px';
        textAreaInput.placeholder = modalData?.placeholder || '';
        textAreaInput.addEventListener('input', (val) => {
          const data = val.target as HTMLInputElement;
          modalData = this.modalDataMap.get(currentElementId);
          this.checkvalidation(data, modalData, container, divError);
          textAreaInput.setAttribute('value', data.value);
        });
        container.appendChild(textAreaInput);
        break;
      }

      case 'Checkbox': {
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.resize = 'both';
        container.style.overflow = 'hidden';
        container.style.width = '150px';
        container.style.minWidth = '100px';

        const checkInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        checkInput.setAttribute('type', 'checkbox');
        checkInput.setAttribute(
          'id',
          modalData?.groupcheck[index].checkid || ''
        );
        checkInput.setAttribute('name', modalData?.groupname || '');
        // Add disabled and readonly attributes
        checkInput.disabled = true;
        checkInput.setAttribute('readonly', 'true');
        // Optional: Add a visual indicator that it's readonly
        checkInput.style.cursor = 'not-allowed';
        checkInput.style.opacity = '0.7';

        checkInput.style.outline = 'none';
        checkInput.style.border = 'none';
        checkInput.style.backgroundColor = '#fbdeb8';
        checkInput.style.flexShrink = '0';
        checkInput.style.width = '40%';
        checkInput.style.height = '40%';

        const label = iframeDocument.createElement('label');
        label.textContent = modalData?.groupcheck[index].checklabel;
        label.style.fontSize = modalData?.fontSize || '16px';
        label.style.flexGrow = '1';
        // Optional: Style the label to match the disabled state
        label.style.cursor = 'not-allowed';
        label.style.opacity = '0.7';

        container.appendChild(checkInput);
        container.appendChild(label);

        break;
      }

      case 'Radio Button': {
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.resize = 'both';
        container.style.overflow = 'hidden';
        container.style.width = '150px';
        container.style.minWidth = '100px';

        const radioInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute(
          'id',
          modalData?.groupradio[index].radioid || ''
        );
        radioInput.setAttribute('name', modalData?.groupname || '');
        // Add disabled and readonly attributes
        radioInput.disabled = true;
        radioInput.setAttribute('readonly', 'true');
        // Optional: Add a visual indicator that it's readonly
        radioInput.style.cursor = 'not-allowed';
        radioInput.style.opacity = '0.7';

        radioInput.style.outline = 'none';
        radioInput.style.border = 'none';
        radioInput.style.backgroundColor = '#fbdeb8';
        radioInput.style.flexShrink = '0';
        radioInput.style.width = '40%';
        radioInput.style.height = '40%';

        const label = iframeDocument.createElement('label');
        label.textContent = modalData?.groupradio[index].label;
        label.style.fontSize = modalData?.fontSize || '16px';
        label.style.flexGrow = '1';
        // Optional: Style the label to match the disabled state
        label.style.cursor = 'not-allowed';
        label.style.opacity = '0.7';

        container.appendChild(radioInput);
        container.appendChild(label);

        break;
      }
      case 'Select': {
        container.style.display = 'block';
        container.style.resize = 'both';
        container.style.overflow = 'hidden';
        container.style.width = '200px';
        container.style.minWidth = '100px';

        const select = iframeDocument.createElement('select');
        select.style.width = '100%';
        select.style.padding = '5px';
        select.style.fontSize = modalData?.fontSize || '16px';
        select.style.border = '1px solid #ccc';
        select.style.borderRadius = '4px';
        select.style.backgroundColor = '#fbdeb8';

        select.style.opacity = '0.7';

        // Add placeholder option if exists
        if (modalData?.placeholder) {
          const placeholderOption = iframeDocument.createElement('option');
          placeholderOption.value = '';
          placeholderOption.textContent = modalData.placeholder;
          placeholderOption.selected = true;

          select.appendChild(placeholderOption);
        }

        // Add options from modalData
        if (modalData?.selectOptions) {
          modalData.selectOptions.forEach((option) => {
            const optionElement = iframeDocument.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.data;
            select.appendChild(optionElement);
          });
        }

        container.appendChild(select);
        break;
      }
      case 'Signature': {
        // Create a container for the canvas
        const canvasContainer = iframeDocument.createElement('div');
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.resize = 'both';
        canvasContainer.style.overflow = 'hidden';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';

        // Enhanced visual indicators for disabled state
        canvasContainer.style.opacity = '0.7';
        canvasContainer.style.cursor = 'not-allowed';

        // Create the canvas element
        const canvas = iframeDocument.createElement(
          'canvas'
        ) as HTMLCanvasElement;
        canvas.width = 300;
        canvas.height = 100;
        canvas.style.outline = 'none';
        canvas.style.backgroundColor = '#fbdeb8';
        canvas.setAttribute('readonly', 'true');
        canvas.setAttribute('disabled', 'true'); // Add disabled attribute
        canvas.setAttribute('id', modalData?.id || '');

        // Set pointer-events to none to prevent any mouse interactions
        canvas.style.pointerEvents = 'none';

        // Append the canvas to the canvas container
        canvasContainer.appendChild(canvas);
        container.appendChild(canvasContainer);

        // Get context for display purposes only
        const context = canvas.getContext('2d');

        // Remove all drawing-related event listeners
        // Keep only the resize functionality

        // Function to resize canvas based on the container's size
        const resizeCanvas = () => {
          const width = canvasContainer.clientWidth;
          const height = canvasContainer.clientHeight;
          canvas.width = width;
          canvas.height = height;

          // Preserve any existing content after resize
          const imageData = context!.getImageData(0, 0, width, height);
          context!.clearRect(0, 0, canvas.width, canvas.height);
          context!.putImageData(imageData, 0, 0);
        };

        // Listen for resize events
        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(canvasContainer);

        // Create a disabled clear button (optional - remove if you don't want it visible)
        const clearButton = iframeDocument.createElement('button');
        clearButton.innerHTML = '&times;';
        clearButton.style.position = 'absolute';
        clearButton.style.right = '5px';
        clearButton.style.top = '5px';
        clearButton.style.backgroundColor = '#fbdeb8';
        clearButton.disabled = true; // Disable the clear button
        clearButton.style.opacity = '0.5'; // Visual indicator that it's disabled
        clearButton.style.cursor = 'not-allowed';

        // Append the clear button to the canvas container
        canvasContainer.appendChild(clearButton);

        break;
      }

      case 'Date/Time': {
        const dateTimeInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        dateTimeInput.setAttribute('type', 'datetime-local');

        const now = new Date();
        const isoString = now.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:MM'
        dateTimeInput.setAttribute('value', isoString);

        // Add readonly attributes
        dateTimeInput.setAttribute('readonly', 'true');
        dateTimeInput.disabled = true;

        // Add visual indicators for readonly state
        dateTimeInput.style.cursor = 'not-allowed';
        dateTimeInput.style.opacity = '0.7';

        dateTimeInput.style.width = '100%';
        dateTimeInput.style.height = '100%';
        dateTimeInput.style.padding = '4px';
        dateTimeInput.style.outline = 'none';
        dateTimeInput.style.border = 'none';
        dateTimeInput.style.backgroundColor = '#fbdeb8';
        dateTimeInput.style.boxSizing = 'border-box';
        dateTimeInput.style.resize = 'none';
        dateTimeInput.setAttribute('id', modalData?.id || '');

        // Remove the change event listener since it's readonly

        container.appendChild(dateTimeInput);
        break;
      }

      default:
        console.error('Unknown input type:', type);
        return;
    }

    const newdiv = iframeDocument.getElementsByClassName('all-inputs');
    newdiv[0].appendChild(container);
    container.addEventListener('dblclick', () => {
      this.AgainOpenDialog(type, currentElementId, iframeDocument);
    });
    this.makeElementDraggable(container, iframeDocument);
  }

  AgainOpenDialog(key: string, elementId: string, iframeDocument: Document) {
    console.log(this.modalDataMap.get(elementId));
    const dialogRef = this.dialog.open(InputModalComponent, {
      height: '90vh',
      data: {
        selectedfield: key,
        current_element_data: this.modalDataMap.get(elementId),
        all_elements: this.modalDataMap,
        current_element_id: elementId,
      },
    });
    let currentElementId = elementId;
    let currentModalData = this.modalDataMap.get(
      elementId || currentElementId
    ) || {
      placeholder: '',
      minlength: null,
      maxlength: null,
      groupname: null,
      groupradio: null,
      groupcheck: null,
      id: '',
      fontSize: '16px',
    };
    dialogRef.afterClosed().subscribe((result) => {
      if (result.status == 'Save') {
        if (result.display) {
          if (result.display.placeholder != '') {
            currentModalData.placeholder = result.display.placeholder || '';
          }
          if (result.display.groupname != '') {
            currentModalData.groupname = result.display.groupname || '';
          }
          if (result.display.id != '') {
            currentModalData.id = result.display.id;
          }
          if (result.display.fontSize != '') {
            currentModalData.fontSize = result.display.fontSize || '16px';
          }
          if (result.display.groupradio.length > 0) {
            currentModalData.groupradio = result.display.groupradio;
          }
          if (result.display.groupcheck.length > 0) {
            currentModalData.groupcheck = result.display.groupcheck;
          }
          if (result.display.selectOptions) {
            currentModalData.selectOptions = result.display.selectOptions;
          }
        }
        if (result.validation) {
          if (result.validation.minlength) {
            currentModalData.minlength = result.validation.minlength || null;
          }
          if (result.validation.maxlength) {
            currentModalData.maxlength = result.validation.maxlength || null;
          }
        }
        this.modalDataMap.set(currentElementId, currentModalData);
        console.log(this.modalDataMap.get(currentElementId));
        const element = iframeDocument.getElementById(currentElementId)
          ?.firstChild as HTMLInputElement;
        element.placeholder =
          this.modalDataMap.get(currentElementId)?.placeholder || '';
        element.setAttribute(
          'id',
          this.modalDataMap.get(currentElementId)?.id || ''
        );
        element.style.fontSize =
          this.modalDataMap.get(currentElementId)?.fontSize || '16px';

        if (element.tagName.toLowerCase() === 'select') {
          // Clear existing options
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }

          // Add new options
          currentModalData.selectOptions?.forEach((option) => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.data;
            element.appendChild(optElement);
          });

          // Update other properties
          element.setAttribute('id', currentModalData.id || '');
          element.style.fontSize = currentModalData.fontSize || '16px';
        }

        if (element.type == 'checkbox') {
          element.setAttribute(
            'name',
            this.modalDataMap.get(currentElementId)?.groupname || ''
          );
          const label = iframeDocument
            .getElementById(currentElementId)
            ?.querySelector('label') as HTMLElement;
          const data = this.modalDataMap
            .get(currentElementId)
            ?.groupcheck.find(
              (d: any) =>
                d.checkid == this.modalDataMap.get(currentElementId)?.id
            );
          element.setAttribute(
            'id',
            this.modalDataMap.get(currentElementId)?.id || ''
          );

          for (let [key, value] of this.modalDataMap) {
            if (
              value.groupname ==
              this.modalDataMap.get(currentElementId)?.groupname
            ) {
              value.groupcheck =
                this.modalDataMap.get(currentElementId)?.groupcheck;
            }
          }
          if (label) {
            label.textContent = data.checklabel;
            label.style.fontSize =
              this.modalDataMap.get(currentElementId)?.fontSize || '16px';
          }
        } else if (element.type == 'radio') {
          element.setAttribute(
            'name',
            this.modalDataMap.get(currentElementId)?.groupname || ''
          );
          const label = iframeDocument
            .getElementById(currentElementId)
            ?.querySelector('label') as HTMLElement;
          const data = this.modalDataMap
            .get(currentElementId)
            ?.groupradio.find(
              (d: any) =>
                d.radioid == this.modalDataMap.get(currentElementId)?.id
            );
          element.setAttribute(
            'id',
            this.modalDataMap.get(currentElementId)?.id || ''
          );

          for (let [key, value] of this.modalDataMap) {
            if (
              value.groupname ==
              this.modalDataMap.get(currentElementId)?.groupname
            ) {
              value.groupradio =
                this.modalDataMap.get(currentElementId)?.groupradio;
            }
          }
          if (label) {
            label.textContent = data.label;
            label.style.fontSize =
              this.modalDataMap.get(currentElementId)?.fontSize || '16px';
          }
        }
      }
      if (result.status == 'Remove') {
        const element = iframeDocument.getElementById(currentElementId);
        if (element) {
          iframeDocument
            .getElementsByClassName('all-inputs')[0]
            .removeChild(element);
          if ((element.firstChild as HTMLInputElement).type == 'checkbox') {
            const currentdata = this.modalDataMap.get(currentElementId);
            for (let [key, value] of this.modalDataMap) {
              if (value.groupname == currentdata?.groupname) {
                value.groupcheck = value.groupcheck.filter(
                  (d: any) => d.checkid != currentdata?.id
                );
              }
            }
          }
          this.modalDataMap.delete(currentElementId);
        }
      } else if (result.status == 'Remove') {
        const element = iframeDocument.getElementById(currentElementId);
        if (element) {
          iframeDocument
            .getElementsByClassName('all-inputs')[0]
            .removeChild(element);
          if ((element.firstChild as HTMLInputElement).type == 'Radio Button') {
            const currentdata = this.modalDataMap.get(currentElementId);
            for (let [key, value] of this.modalDataMap) {
              if (value.groupname == currentdata?.groupname) {
                value.groupradio = value.groupradio.filter(
                  (d: any) => d.radioid != currentdata?.id
                );
              }
            }
          }
          this.modalDataMap.delete(currentElementId);
        }
      }
    });
  }

  checkvalidation(data: any, modalData: any, container: any, divError: any) {
    if (modalData?.minlength && modalData?.maxlength) {
      if (data.value.length > modalData?.maxlength) {
        divError.innerHTML = `It must have no more than ${modalData?.maxlength} character`;
        container.appendChild(divError);
      } else if (data.value.length < modalData?.minlength) {
        divError.innerHTML = `It must have at least ${modalData?.minlength} character`;
        container.appendChild(divError);
      } else {
        divError.innerHTML = '';
        if (container.contains(divError)) {
          container.removeChild(divError);
        }
      }
    } else if (modalData?.maxlength) {
      if (data.value.length > modalData?.maxlength) {
        divError.innerHTML = `It must have no more than ${modalData?.maxlength} character`;
        container.appendChild(divError);
      } else {
        divError.innerHTML = '';
        if (container.contains(divError)) {
          container.removeChild(divError);
        }
      }
    } else if (modalData?.minlength) {
      if (data.value.length < modalData?.minlength) {
        divError.innerHTML = `It must have at least ${modalData?.minlength} character`;
        container.appendChild(divError);
      } else {
        divError.innerHTML = '';
        if (container.contains(divError)) {
          container.removeChild(divError);
        }
      }
    }
  }

  startResizing(
    event: MouseEvent,
    container: HTMLElement,
    corner: string,
    iframeDocument: Document
  ) {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = container.offsetWidth;
    const startHeight = container.offsetHeight;
    const startLeft = container.offsetLeft;
    const startTop = container.offsetTop;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Resize logic for different corners
      if (corner === 'bottom-right') {
        container.style.width = `${startWidth + deltaX}px`;
        container.style.height = `${startHeight + deltaY}px`;
      } else if (corner === 'bottom-left') {
        container.style.width = `${startWidth - deltaX}px`;
        container.style.height = `${startHeight + deltaY}px`;
        container.style.left = `${startLeft + deltaX}px`;
      } else if (corner === 'top-right') {
        container.style.width = `${startWidth + deltaX}px`;
        container.style.height = `${startHeight - deltaY}px`;
        container.style.top = `${startTop + deltaY}px`;
      } else if (corner === 'top-left') {
        container.style.width = `${startWidth - deltaX}px`;
        container.style.height = `${startHeight - deltaY}px`;
        container.style.left = `${startLeft + deltaX}px`;
        container.style.top = `${startTop + deltaY}px`;
      }
    };

    const onMouseUp = () => {
      iframeDocument.removeEventListener('mousemove', onMouseMove);
      iframeDocument.removeEventListener('mouseup', onMouseUp);
    };

    iframeDocument.addEventListener('mousemove', onMouseMove);
    iframeDocument.addEventListener('mouseup', onMouseUp);
  }

  makeElementDraggable(element: HTMLElement, iframeDocument: Document) {
    let offsetX = 0;
    let offsetY = 0;

    // Drag start event to capture offsets
    element.addEventListener('dragstart', (event: DragEvent) => {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
      event.dataTransfer?.setData('text/plain', element.id);
    });

    // Prevent default behavior to allow dropping inside the iframe
    iframeDocument.body.addEventListener('dragover', (event: DragEvent) => {
      event.preventDefault();
    });

    // Drop event to handle the element being dropped
    iframeDocument.body.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();

      // Get the ID of the dragged element
      const elementId = event.dataTransfer?.getData('text/plain');
      const draggedElement = iframeDocument.getElementById(elementId!);

      if (draggedElement) {
        // Get the scroll positions of the iframe document
        const scrollLeft =
          iframeDocument.documentElement.scrollLeft ||
          iframeDocument.body.scrollLeft;
        const scrollTop =
          iframeDocument.documentElement.scrollTop ||
          iframeDocument.body.scrollTop;

        // Calculate the correct drop position considering scroll and offsets
        const x = event.clientX - offsetX + scrollLeft;
        const y = event.clientY - offsetY + scrollTop;

        // Set the new position of the dragged element
        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;

        console.log(`Element dropped at: ${x}, ${y}`);
      }
    });
  }
  submitpdf() {
    // const formData = new FormData();
    // const filename = this.filename.split('.')[0];
    // if (filename != undefined) {
    //   formData.append('FileName', filename);
    // }
    // const iframe = this.iframeElement.nativeElement;
    // const iframeDocument =
    //   iframe.contentDocument || iframe.contentWindow.document;
    // const divContent = iframeDocument.getElementsByClassName('all-inputs')[0];

    // formData.append('divContent', divContent.outerHTML);
    // this.data.getpdf(formData).subscribe({
    //   next: (d: Blob) => {
    //     let navigationExtras: NavigationExtras = {};
    //     const blob = new Blob([d], { type: 'application/pdf' });
    //     const filereader = new FileReader();
    //     filereader.readAsDataURL(blob);
    //     filereader.onload = () => {
    //       const result = filereader.result;
    //       const data = result?.toString();
    //       if (data) {
    //         navigationExtras.state = {
    //           html_to_pdf: data,
    //           pdf: this.pdfHtml,
    //           filename: this.filename,
    //         };
    //         this.router.navigate([`/use/${this.formName}`], navigationExtras);
    //       }
    //     };
    //   },
    // });
    const filename = this.filename.split('.')[0];
    const iframe = this.iframeElement.nativeElement;
    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document;
    const divContent = iframeDocument.getElementsByClassName('all-inputs')[0];
    if (filename && this.selectedFormType) {
      this.data
        .createNewForm(
          filename,
          this.selectedFormType,
          'AC30A360-3463-4A3F-A8B1-D89315BA2BD3',
          divContent.outerHTML
        )
        .subscribe({
          next: (data: any) => {
            console.log(data);
          },
        });
      const snackBarRef = this.snackBar.open(
        'Form created successfully!',
        'Close',
        {
          duration: 2000, // Adjust duration as needed
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        }
      );

      // Navigate after the snackbar duration completes
      snackBarRef.afterDismissed().subscribe(() => {
        this.router.navigate(['/template']);
      });
    }
  }
}

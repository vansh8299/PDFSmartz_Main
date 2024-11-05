import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}
  public pdf_to_html!: string;
  private api = environment.convertpdf;
  private htmlapi = environment.converthtml;
  private createnewform=environment.createNewForm;
  private getforms=environment.getforms;
  addpdf(formData: FormData): Observable<string> {
    return this.http
      .post<string>(this.api, formData, {
        responseType: 'text' as 'json',
      })
      .pipe(map((htmlContent) => this.processHtmlContent(htmlContent)));
  }

  private processHtmlContent(htmlContent: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const pages = doc.body.children;

    const wrapper = doc.createElement('div');
    wrapper.className = 'pdf-pages-wrapper';
    wrapper.style.cssText = `
      background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjOWU5ZTllIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=);
      background-color: grey;
      
    `;

    Array.from(pages).forEach((page, index) => {
      const pageWrapper = doc.createElement('div');
      pageWrapper.className = 'pdf-page';
      pageWrapper.style.cssText = `
        background-color: white;
        margin: 0 0 20px 0; /* Only bottom margin */
    
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      `;

      pageWrapper.appendChild(page);
      wrapper.appendChild(pageWrapper);
    });

    doc.body.innerHTML = '';
    doc.body.appendChild(wrapper);

    return doc.documentElement.outerHTML;
  }
  getpdf(formData: FormData): Observable<Blob> {
    return this.http.post<Blob>(this.htmlapi, formData, {
      responseType: 'blob' as 'json',
    });
  }
  createNewForm(name:string,type:string,createdby:string,divcontent:string):Observable<any>{
    return this.http.post<any>(`${this.createnewform}/Name=${name}&Type=${type}&CreatedBy=${createdby}&DivContent=${divcontent}`,{})
  }
  getPdfForms():Observable<any>{
    return this.http.get<any>(this.getforms)
  }
}

export interface Modal {
  placeholder: string;
  minlength?: number | null;
  maxlength?: number | null;
  groupname?: string | null;
  groupradio?: any;
  groupcheck?: any;
  selectOptions?: Array<{ data: string; value: string }>;
  id: string;
  fontSize?: string;
}

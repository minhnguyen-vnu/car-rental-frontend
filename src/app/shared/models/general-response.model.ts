export interface Status {
  code: number;
  displayMessage: string;
}

export interface GeneralResponse<T> {
  status: Status;
  data?: T;
}

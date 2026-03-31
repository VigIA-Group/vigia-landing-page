export interface WaitingList {
  title: string;
  description: string;
  benefit: Benefit;
  call_to_action: string;
}

export interface Benefit {
  discount: string;
  priority_access: string;
  exclusive_content: string;
}

export interface WaitingListForm {
  email: string;
  phoneNumber: string;
  marketSegment: string;
}

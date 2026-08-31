export interface MediaFile {
  uid: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  category: string;
  description?: string;
  gallery: MediaFile[];
}

export interface Product extends ProductPayload {
  id: string;
  createdAt: string;
}

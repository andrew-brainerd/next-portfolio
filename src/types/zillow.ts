export interface ZillowProperty {
  address: string;
  price: string;
  monthlyRent: string;
  link: string;
  status: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  yearBuilt: number;
  laundry: string;
  parking: string;
  heating: string;
  cooling: string;
  petsAllowed: string;
  amenities: string[];
  availableDate: string;
  leaseTerm: string;
  deposit: string;
  image: string;
  updatedOn: string;
  filename: string;
  lotSize: string | null;
  description: string | null;
}

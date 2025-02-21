export type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  bikeSerialNumbers: string[]; // Changed from bikeIds
  // Add any other client fields you need
}; 



export type Sale = {
  id: string;
  clientId: string;
  bikeId: string;
  saleDate: string;
};

export interface Job {
  id?: string;
  customerName: string;
  customerPhone: string;
  bikeModel: string;
  dateIn: string;
  workRequired: string;
  workDone: string;
  laborCost: number;
  totalCost: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  name: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  logo?: string;
  features: {
    sales: boolean;
    jobs: boolean;
  };
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  theme: {
    primary: string;
  };
  photos: string[];
  notes?: string;
}

export interface Bike {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  year: number;
  color: string;
  type: string;
  size: string;
  status: 'available' | 'sold' | 'maintenance';
  purchaseDate?: string;
  purchasePrice?: number;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id?: string;
  // Bike info
  bikeId: string;
  brand: string;
  model: string;
  serialNumber: string;
  year: number;
  color: string;
  type: string;
  size: string;
  
  // Client info
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  // Sale details
  price: number;
  saleDate: string;
  paymentMethod: 'cash' | 'credit' | 'transfer';
  status: 'completed';
  
  // Documentation
  photos: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
// src/app/services/mock-rental-data.ts
import { RentalResponseDTO } from './rental.service';

export const MOCK_RENTALS: RentalResponseDTO[] = [
  {
    id: 101,
    transactionCode: "RENT-2025-0001",
    userId: 88,
    vehicleId: 5,
    paymentId: 201,
    pickupTime: "2025-12-01T09:00:00",
    returnTime: "2025-12-05T18:00:00",
    pickupBranchId: 1,
    returnBranchId: 2,
    durationDays: 4.375,
    totalAmount: 3200000,
    currency: "VND",
    status: "CONFIRMED"
  },
  {
    id: 102,
    transactionCode: "RENT-2025-0002",
    userId: 92,
    vehicleId: 12,
    paymentId: 202,
    pickupTime: "2025-12-10T14:00:00",
    returnTime: "2025-12-12T12:00:00",
    pickupBranchId: 3,
    returnBranchId: 3,
    durationDays: 1.916,
    totalAmount: 1800000,
    currency: "VND",
    status: "PENDING"
  },
  {
    id: 103,
    transactionCode: "RENT-2025-0003",
    userId: 77,
    vehicleId: 8,
    paymentId: 203,
    pickupTime: "2025-11-15T10:00:00",
    returnTime: "2025-11-18T10:00:00",
    pickupBranchId: 2,
    returnBranchId: 1,
    durationDays: 3,
    totalAmount: 4500000,
    currency: "VND",
    status: "COMPLETED"
  },
  {
    id: 104,
    transactionCode: "RENT-2025-0004",
    userId: 99,
    vehicleId: 3,
    paymentId: 204,
    pickupTime: "2025-12-20T08:00:00",
    returnTime: "2025-12-25T17:00:00",
    pickupBranchId: 1,
    returnBranchId: 1,
    durationDays: 5.375,
    totalAmount: 6800000,
    currency: "VND",
    status: "CANCELLED"
  }
];
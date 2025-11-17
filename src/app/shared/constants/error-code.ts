export class ErrorCode {
  // OK
  static readonly SUCCESS = { code: 200, message: 'Success' };

  // 1xxx: Auth
  static readonly AUTH_NO_PERMISSION = { code: 1000, message: 'No permission' };
  static readonly AUTH_ACCOUNT_NOT_FOUND = { code: 1001, message: 'Account not found' };
  static readonly AUTH_INVALID_PASSWORD = { code: 1002, message: 'Invalid password' };
  static readonly AUTH_TOKEN_INVALID = { code: 1003, message: 'Invalid or expired token' };
  static readonly AUTH_USERNAME_EXISTS = { code: 1004, message: 'Username already exists' };
  static readonly AUTH_EMAIL_EXISTS = { code: 1005, message: 'Email already exists' };
  static readonly AUTH_PHONE_EXISTS = { code: 1006, message: 'Phone already exists' };
  static readonly AUTH_ACCOUNT_INACTIVE = { code: 1007, message: 'Account is not active' };
  static readonly AUTH_ACCOUNT_PENDING = { code: 1008, message: 'Account is pending approval' };

  // 2xxx: Validation
  static readonly REQ_MISSING_FIELD = { code: 2001, message: 'Missing required field' };
  static readonly REQ_INVALID_EMAIL = { code: 2002, message: 'Invalid email format' };
  static readonly REQ_INVALID_PHONE = { code: 2003, message: 'Invalid phone format' };
  static readonly REQ_INVALID_PASSWORD = { code: 2004, message: 'Invalid password' };
  static readonly REQ_INVALID_USERNAME = { code: 2005, message: 'Invalid username' };
  static readonly REQ_INVALID_NAME = { code: 2006, message: 'Invalid name declared' };
  static readonly REQ_BODY_NULL = { code: 2007, message: 'Request body is null' };
  static readonly REQ_ID_REQUIRED = { code: 2008, message: 'Id is required' };
  static readonly REQ_INVALID_TIME_RANGE = { code: 2009, message: 'Invalid time range' };
  static readonly REQ_INVALID_DURATION = { code: 2010, message: 'Invalid duration value' };
  static readonly REQ_INVALID_AMOUNT = { code: 2011, message: 'Invalid amount value' };

  // 3xxx: Vehicle
  static readonly VEHICLE_NOT_FOUND = { code: 3001, message: 'Vehicle not found' };
  static readonly VEHICLE_EXISTED = { code: 3002, message: 'Vehicle existed' };
  static readonly VEHICLE_NOT_AVAILABLE = { code: 3003, message: 'Vehicle is not available' };
  static readonly VEHICLE_NOT_AVAILABLE_THAT_BRANCH = { code: 3004, message: 'Vehicle does not exist in request pick up branch' };
  static readonly VEHICLE_OVERLAP_WITH_EXISTED_RENTAL = { code: 3005, message: 'Vehicle is not available within that time range' };
  static readonly VEHICLE_OVERLAP_WITH_VEHICLE_BLOCKS = { code: 3006, message: 'Vehicle is not available within that time range' };

  // 4xxx: Branch
  static readonly BRANCH_NOT_FOUND = { code: 4001, message: 'Branch not found' };
  static readonly BRANCH_EXISTED = { code: 4002, message: 'Branch existed' };

  // 5xxx: Rental
  static readonly RENTAL_NOT_FOUND = { code: 5001, message: 'Rental not found' };
  static readonly RENTAL_IDENTIFIER_REQUIRED = { code: 5002, message: 'Id or transactionCode is required' };
  static readonly RENTAL_WRONG_STATUS_TRANSFORM = { code: 5003, message: 'Status transformation not allowed' };

  // 6xxx: Payment
  static readonly PAYMENT_NOT_FOUND = { code: 6001, message: 'Payment not found' };
  static readonly PAYMENT_PROVIDER_UNSUPPORTED = { code: 6002, message: 'Unsupported payment provider' };
  static readonly PAYMENT_SIGNATURE_INVALID = { code: 6003, message: 'Invalid provider signature' };
  static readonly PAYMENT_AMOUNT_MISMATCH = { code: 6004, message: 'Amount mismatch' };
  static readonly PAYMENT_TMN_INVALID = { code: 6005, message: 'Invalid terminal code' };
  static readonly PAYMENT_STATUS_FINALIZED = { code: 6006, message: 'Payment already finalized' };
  static readonly PAYMENT_BUILD_URL_FAILED = { code: 6007, message: 'Build checkout URL failed' };
  static readonly PAYMENT_EXTERNAL_CALL_FAILED = { code: 6008, message: 'External call failed' };
  static readonly PAYMENT_METHOD_REQUIRED = { code: 6009, message: 'Payment method is required' };
  static readonly PAYMENT_PROVIDER_REQUIRED = { code: 6010, message: 'Payment provider is required' };
  static readonly PAYMENT_IDEMPOTENCY_CONFLICT = { code: 6011, message: 'Idempotency conflict' };

  // 9xxx: System
  static readonly SYS_UNEXPECTED = { code: 9000, message: 'Unexpected error' };
}

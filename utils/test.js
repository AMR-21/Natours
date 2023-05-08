// const crypto = require('crypto');

// // Sample data to be sent in the request
// const requestBody = {
//   amount_cents: 1000,
//   currency: 'EGP',
//   merchant_order_id: '123456',
//   billing_data: {
//     email: 'john.doe@example.com',
//   },
//   shipping_data: {
//     first_name: 'John',
//     last_name: 'Doe',
//     phone_number: '+201111111111',
//     apartment: '5',
//     floor: '3',
//     building: '2',
//     street: 'Sample Street',
//     postal_code: '12345',
//     city: 'Sample City',
//     state: 'Sample State',
//     country: 'Sample Country',
//   },
// };

// // Your HMAC Secret Key
// const hmacSecret = 'CCD1251AFDFCC8CF7C1FFAD476FEE3E0';

// // Calculate HMAC signature for the request data
// function calculateHmacSignature(requestBody, hmacSecret) {
//   // Convert request body to JSON string
//   const requestBodyString = JSON.stringify(requestBody);

//   // Calculate HMAC signature using SHA512 algorithm and HMAC secret
//   const hmac = crypto
//     .createHmac('sha512', hmacSecret)
//     .update(requestBodyString)
//     .digest('hex');

//   // Return the calculated HMAC signature
//   return hmac;
// }

// // Example usage: Calculate HMAC signature for the sample request data
// const hmacSignature = calculateHmacSignature(requestBody, hmacSecret);
// console.log('HMAC Signature:', hmacSignature);

// CCD1251AFDFCC8CF7C1FFAD476FEE3E0;

const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const requestBody = {
  type: 'TRANSACTION',
  obj: {
    id: 104303043,
    pending: false,
    amount_cents: 49700,
    success: true,
    is_auth: false,
    is_capture: false,
    is_standalone_payment: true,
    is_voided: false,
    is_refunded: false,
    is_3d_secure: true,
    integration_id: 3782202,
    profile_id: 776731,
    has_parent_transaction: false,
    order: {
      id: 120346573,
      created_at: '2023-05-08T16:06:10.873514',
      delivery_needed: false,
      merchant: [Object],
      collector: null,
      amount_cents: 49700,
      shipping_data: [Object],
      currency: 'EGP',
      is_payment_locked: false,
      is_return: false,
      is_cancel: false,
      is_returned: false,
      is_canceled: false,
      merchant_order_id: null,
      wallet_notification: null,
      paid_amount_cents: 49700,
      notify_user_with_email: false,
      items: [Array],
      order_url:
        'https://accept.paymob.com/standalone/?ref=i_LRR2akhjZmVTL0pVQ25iWGJvYThTMGtQdz09X3lWUHlCc1Qzd3M1T0RxK3dUUjNra3c9PQ',
      commission_fees: 0,
      delivery_fees_cents: 0,
      delivery_vat_cents: 0,
      payment_method: 'tbc',
      merchant_staff_tag: null,
      api_source: 'OTHER',
      data: {},
    },
    created_at: '2023-05-08T16:06:20.875314',
    transaction_processed_callback_responses: [],
    currency: 'EGP',
    source_data: {
      pan: '2346',
      type: 'card',
      tenure: null,
      sub_type: 'MasterCard',
    },
    api_source: 'IFRAME',
    terminal_id: null,
    merchant_commission: 0,
    installment: null,
    discount_details: [],
    is_void: false,
    is_refund: false,
    data: {
      gateway_integration_pk: 3782202,
      klass: 'MigsPayment',
      created_at: '2023-05-08T13:06:39.147885',
      amount: 49700,
      currency: 'EGP',
      migs_order: [Object],
      merchant: 'TESTMERCH_C_25P',
      migs_result: 'SUCCESS',
      migs_transaction: [Object],
      txn_response_code: 'APPROVED',
      acq_response_code: '00',
      message: 'Approved',
      merchant_txn_ref: '104303043',
      order_info: '120346573',
      receipt_no: '312813107613',
      transaction_no: '123456789',
      batch_no: 20230508,
      authorize_id: '107613',
      card_type: 'MASTERCARD',
      card_num: '512345xxxxxx2346',
      secure_hash: '',
      avs_result_code: '',
      avs_acq_response_code: '00',
      captured_amount: 497,
      authorised_amount: 497,
      refunded_amount: 0,
    },
    is_hidden: false,
    payment_key_claims: {
      exp: 1683554771,
      extra: {},
      pmk_ip: '41.40.115.18',
      user_id: 1341850,
      currency: 'EGP',
      order_id: 120346573,
      amount_cents: 49700,
      billing_data: [Object],
      integration_id: 3782202,
      lock_order_when_paid: false,
      single_payment_attempt: false,
    },
    error_occured: false,
    is_live: false,
    other_endpoint_reference: null,
    refunded_amount_cents: 0,
    source_id: -1,
    is_captured: false,
    captured_amount: 0,
    merchant_staff_tag: null,
    updated_at: '2023-05-08T16:06:39.168831',
    is_settled: false,
    bill_balanced: false,
    is_bill: false,
    owner: 1341850,
    parent_transaction: null,
  },
  issuer_bank: null,
  transaction_processed_callback_responses: '',
};

const rcvHMAC =
  'b71685a40bed897cda41639669c97db2f62bc4a0ee1ae45e2ed8277b2a5ad3be80bb190d7b20d84a9e9b25f7dca6dda1e08178d4b1c83163003f108f45990cb5';

const data = requestBody.obj;
const fields = JSON.parse(process.env.PAYMOB_HMAC_STRING_KEYS);

// const keys =
const hmacString = fields
  .map((field) => {
    if (field.includes('.')) {
      const [obj, key] = field.split('.');
      return data[obj][key];
    }
    return data[field];
  })
  .join('');

// console.log(process.env.PAYMOB_HMAC_SECRET);

// console.log(hmacString);

const hmac = crypto
  .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
  .update(hmacString)
  .digest('hex');

console.log(hmac === rcvHMAC);

const [x, y] = ['x', 'y', 'z'];
console.log(x, y);

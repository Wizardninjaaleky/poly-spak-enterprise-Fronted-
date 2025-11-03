# Manual M-Pesa Payment Verification Implementation

## Backend Updates
- [ ] Update Payment model schema (mpesaCode unique, paymentStatus enum, phoneNumber)
- [ ] Modify payment controller for new workflow (submit Pending, verify Confirmed/Rejected)
- [ ] Update payment routes and validation rules
- [ ] Add phoneNumber to payment submission
- [ ] Update mpesaService for new verification logic
- [ ] Add reCAPTCHA validation middleware

## Frontend Updates
- [ ] Create PaymentForm component for post-checkout submission
- [ ] Create Payment page (/payment) with form
- [ ] Create PaymentStatus page (/payment/status) for checking verification
- [ ] Update checkout page to redirect to payment form after order creation
- [ ] Add Payments tab to admin dashboard with verification interface
- [ ] Update API service calls for new endpoints
- [ ] Integrate reCAPTCHA in payment form

## Security & Validation
- [ ] Add reCAPTCHA integration (backend and frontend)
- [ ] Enhance input validation and sanitization
- [ ] Add rate limiting for payment submissions
- [ ] Update environment variables (.env files)

## Dependencies & Deployment
- [ ] Update backend package.json with reCAPTCHA dependency
- [ ] Update frontend package.json if needed
- [ ] Test complete payment flow
- [ ] Update deployment scripts for Render
- [ ] Ensure MongoDB Atlas connection works

## Testing
- [ ] Test payment submission flow
- [ ] Test admin verification process
- [ ] Test status checking
- [ ] Test security measures (rate limiting, validation)

/*
  Site settings — edit these, no other code changes needed.

  razorpayUrl   The foundation's Razorpay.me page. Donors pay here.
  formEndpoint  Where form submissions (donor details, volunteer, contact) are sent.
                Default uses FormSubmit (https://formsubmit.co), which emails each
                submission to the address in the URL. The FIRST submission triggers an
                activation email to that inbox — open it and click "Activate" once.
                After activation FormSubmit shows a random alias; you can paste
                https://formsubmit.co/ajax/<alias> here to hide the email address.
                Set to '' to turn sending off (forms then show the email fallback).
  contactEmail  Shown to visitors when automatic sending is not possible.
*/
window.SSF_CONFIG = {
  razorpayUrl: 'https://razorpay.me/@steppingstonefoundation',
  formEndpoint: 'https://formsubmit.co/ajax/mail@ssfnagpur.org',
  contactEmail: 'mail@ssfnagpur.org'
};

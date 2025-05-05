document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    const methodRadios = document.querySelectorAll('input[name="method"]');
    const phoneField = document.getElementById('phoneField');
    const accountField = document.getElementById('accountField');
    
    // Show relevant fields based on payment method
    methodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            phoneField.style.display = this.value === 'mpesa' ? 'block' : 'none';
            accountField.style.display = (this.value === 'equity' || this.value === 'coop') ? 'block' : 'none';
        });
    });
    
    // Handle form submission
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const amount = document.getElementById('amount').value;
        const method = document.querySelector('input[name="method"]:checked').value;
        const phone = method === 'mpesa' ? document.getElementById('phone').value : null;
        const account = (method === 'equity' || method === 'coop') ? document.getElementById('account').value : null;
        
        const statusDiv = document.getElementById('paymentStatus');
        statusDiv.innerHTML = '<div class="processing">Processing payment...</div>';
        
        try {
            const response = await fetch('/initiate-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_method: method,
                    amount: amount,
                    phone: phone,
                    account: account
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                if (method === 'mpesa') {
                    statusDiv.innerHTML = `
                        <div class="success">
                            <i class="fas fa-check-circle"></i>
                            <h3>Payment Request Sent</h3>
                            <p>Check your phone to complete M-Pesa payment</p>
                            <p>Transaction ID: ${result.CheckoutRequestID}</p>
                        </div>
                    `;
                } else {
                    statusDiv.innerHTML = `
                        <div class="success">
                            <i class="fas fa-check-circle"></i>
                            <h3>Payment Initiated</h3>
                            <p>Bank transfer request submitted</p>
                            <p>Reference: ${result.reference || result.transactionReference}</p>
                        </div>
                    `;
                }
            } else {
                throw new Error(result.error || 'Payment failed');
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div class="error">
                    <i class="fas fa-times-circle"></i>
                    <h3>Payment Failed</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    });
});
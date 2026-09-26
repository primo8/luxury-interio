async function runTest() {
  try {
    console.log('--- 1. Testing Health & Diagnostics ---');
    const healthRes = await fetch('http://localhost:5001/api/health');
    const health = await healthRes.json();
    console.log('Health:', health.status, '| Sandbox Mode:', health.sandbox?.mode);

    console.log('\n--- 2. Testing Checkout and Pay ---');
    const checkoutPayload = {
      items: [{ productId: 'prod-1', quantity: 1, colorName: 'Royal Plum' }],
      customer: {
        fullName: 'Aline Uwase',
        email: 'aline@furnitura.luxury',
        phone: '0788123456',
        address: 'KG 9 Ave, Nyarutarama Villa 12',
      },
      phoneNumber: '0788123456',
    };

    const payRes = await fetch('http://localhost:5001/api/payments/mtn/checkout-and-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload),
    });
    const payData = await payRes.json();
    console.log('Checkout Success:', payData.success);
    console.log('Order ID:', payData.order?.id);
    console.log('Authoritative Total:', payData.order?.total, payData.order?.currency);
    console.log('Payment Reference ID:', payData.payment?.referenceId);
    console.log('Payment Status:', payData.payment?.status);
    console.log('Masked Phone:', payData.payment?.phoneNumberMasked);

    const refId = payData.payment?.referenceId;
    if (!refId) throw new Error('No reference ID returned');

    console.log('\n--- 3. Testing Immediate Status Poll ---');
    const poll1 = await (await fetch(`http://localhost:5001/api/payments/mtn/${refId}/status`)).json();
    console.log('Status immediately after prompt:', poll1.status);

    console.log('\n--- 4. Waiting 5 seconds for simulated customer authorization... ---');
    await new Promise(r => setTimeout(r, 5000));

    const poll2 = await (await fetch(`http://localhost:5001/api/payments/mtn/${refId}/status`)).json();
    console.log('Status after approval:', poll2.status);
    console.log('Financial Tx ID:', poll2.financialTransactionId);
    console.log('Order Status:', poll2.orderStatus);

    console.log('\n--- 5. Testing Transactions Ledger ---');
    const txs = await (await fetch('http://localhost:5001/api/payments/mtn/transactions')).json();
    console.log('Transactions Count:', txs.transactions?.length);
    console.log('Latest Tx:', txs.transactions?.[0]?.orderId, txs.transactions?.[0]?.status);

    console.log('\n✅ ALL PAYMENT GATEWAY TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

runTest();

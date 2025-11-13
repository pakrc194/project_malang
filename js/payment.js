const baseParams = {
  orderName: 'test_말랑티켓',
  amount: 500,   // 금액 받을곳
  merchantId: '9810030930',
  orderId: new Date().getTime().toString(),
  userId: 'user@naver.com',
  successUrl: '/payment/success',
  // successUrl: 'https://developers.danalpay.com/sandbox/callback?status=success',
  failUrl: '/payment/fail',
  // failUrl: 'https://developers.danalpay.com/sandbox/callback?status=fail',
  userEmail: 'user@naver.com',
  userName: '김다날',
};

function requestPayment() {
  const paymethod = document.querySelector('input[name="payment-method"]:checked')?.value;
  const danalPayments = DanalPayments('CL_TEST_I4d8FWYSSKl-42F7y3o9g_7iexSCyHbL8qthpZxPnpY=');

  switch (paymethod) {
    case 'INTEGRATED':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
        methods:{
          mobile: {
            itemCode: '1270000000',
            itemType: '1',
          },
          virtualAccount: {
            notiUrl: 'https://notiUrl.com',
          },
          card: {},
          naverPay: {},
          kakaoPay: {},
          payco: {},
          transfer: {},
          cultureland: {},
          bookAndLife: {},
        }
      });
    case 'CARD':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
      });
    case 'MOBILE':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
        itemCode: '1270000000',
        itemType: '1',
      });

    case 'TRANSFER':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
      });

    case 'VACCOUNT':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
        notiUrl: 'https://notiUrl.com',
      });
    case 'PAYCO':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
        installmentMonths: ['00'],
      });
    case 'KAKAOPAY':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
        installmentMonths: ['00'],
      });
    case 'NAVERPAY':
      return danalPayments.requestPayment({
        ...baseParams,
        paymentsMethod: paymethod,
        installmentMonths: ['00'],
      });
    // case 'CULTURELAND':
    // case 'BOOK_AND_LIFE':
    //   return danalPayments.requestPayment({
    //     ...baseParams,
    //     paymentsMethod: paymethod,
    //   });
  }
}

const payButton = document.getElementById('payButton');
if (payButton) {
  const handleClick = async () => {
    const paymethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    if (!paymethod) return;
    payButton.disabled = true;
    try {
      await requestPayment();
    } catch (err) {
      alert('오류가 발생했습니다.');
      console.error(err);
      payButton.disabled = false;
    }
  };
  payButton.onclick = handleClick;
}

const buttons = document.querySelectorAll('.payment-method-button');
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const methods = document.querySelectorAll('.payment-method-button');
    methods.forEach((method) => {
      method.classList.remove('selected');
    });
    button.classList.add('selected');
    const radio = button.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});


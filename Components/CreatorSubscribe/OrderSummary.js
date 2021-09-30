import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './CheckoutForm.module.scss';

const OrderSummary = ({ creator }) => {
  const [subInfo, setSubInfo] = useState();

  useEffect(() => {
    const getCreatorSubInfo = async () => {
      const response = await axios.post('/api/sundae/accounts/creators/creatorSubInfo', {
        id: creator.id,
      });
      setSubInfo(JSON.parse(response.data.creatorSubscriptionInfo));
    };
    getCreatorSubInfo();
  }, [creator]);

  const getFormatAmount = (amount) => {
    amount /= 100;
    return amount.toString();
  };

  if (!subInfo) {
    return null;
  }
  const { interval } = subInfo.recurring;
  return (
    <div className={styles.order_summary_container}>
      <div className={styles.amount_container}>
        <h1>
          $
          {getFormatAmount(subInfo.unit_amount)}
        </h1>
        <small>per month</small>
        {/* <span>Today's charge</span> */}
      </div>
      {/* <div className={styles.user_summary}>
        <h1>Order Summary</h1>
        <p>Subscription for {creator.creatorTitle}</p>
        <p className={styles.price} >
          ${getFormatAmount(subInfo.unit_amount)} a {interval}
        </p>
      </div> */}
      <div className={styles.summary_point}>
        <span>✓</span>
        {' '}
        <p> Stay up to date</p>
      </div>
      <div className={styles.summary_point}>
        <span>✓</span>
        {' '}
        <p> Be part of a community</p>
      </div>
      <div className={`${styles.summary_point} ${styles.rounded_point}`}>
        <span>✓</span>
        {' '}
        <p> Show your support</p>
      </div>
    </div>
  );
};

export default OrderSummary;

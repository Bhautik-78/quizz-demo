import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React, { useState, useRef } from 'react';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';
import styles from './CheckoutForm.module.scss';

const stripePromise = loadStripe('pk_test_brYXx7UrkZ35GE6dM4xc5z1e00gxbHwEYB');

const CreatorSubscribe = ({ creator, handle }) => {
  console.log(creator, 'creator===============');
  const [email, setEmail] = useState(null);
  const emailRef = useRef(null);
  if (!email) {
    return (
      <div className={styles.sub_email_container}>
        <div className={styles.prof_container}>
          <div className={styles.img_container}>
            <img src={creator ? creator.imageUrl : ''} alt={creator.creatorTitle} />
          </div>
          <h4>{creator ? creator.creatorTitle : ''}</h4>
          <p>{creator ? creator.creatorDescription : ''}</p>
        </div>
        <div className={styles.subs_email_container}>
          <input placeholder="Type your email" type="email" ref={emailRef} />
          <button type="button" onClick={() => setEmail(emailRef.current.value)}>
            Subscribe
          </button>
        </div>
      </div>
    );
  }
  console.log(email);
  return (
    <div className={styles.strip_form_container}>
      <div className={styles.summary_top_sec}>
        <OrderSummary creator={creator} />
      </div>
      <div className={styles.form_riight}>
        <Elements stripe={stripePromise}>
          <CheckoutForm email={email} creator={creator} handle={handle} />
        </Elements>
      </div>
    </div>
  );
};

export default CreatorSubscribe;

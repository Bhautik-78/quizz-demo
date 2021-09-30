/* eslint-disable camelcase */
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Input,
  Form,
  Label,
  Button,
  Modal,
  ModalHeader,
  ModalFooter,
  Alert,
  FormGroup,
  ModalBody,
  Spinner,
} from 'reactstrap';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from './CheckoutForm.module.scss';

const CheckoutForm = (props) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const { email, creator, handle } = props;
  const stripe = useStripe();
  const elements = useElements();

  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState();
  const [modalBody, setModalBody] = useState();
  const [modalButton, setModalButton] = useState();

  const toggle = () => {
    console.log('toggl', modal, !modal);
    setModal(!modal);
  };
  console.log(email);

  const handleSubmit = async (event) => {
    console.log(event);
    event.preventDefault();
    setLoading(true);
    // eslint-disable-next-line camelcase
    const billing_details = {
      email: props.email,
      name: event.target.name.value,
    };
    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details,
    });
    await handleStripePaymentMethod(result, billing_details);
  };

  const handleStripePaymentMethod = async (result, billingDetails) => {
    if (result.error) {
      setModalTitle('Error');
      setModalBody(result.error.message);
      setModal(true);
      setLoading(false);
    } else {
      console.log(result);
      const response = await axios.post(
        '/api/sundae/subscription/createWebUserAndStripeSubscription',
        {
          paymentMethodId: result.paymentMethod.id,
          email,
          creatorId: creator.id,
          otherInfoJson: JSON.stringify(billingDetails),
        }
      );
      const { subscriptionJson, sessionId, isSubscriberAlready } =        response.data;
      const subscription = JSON.parse(subscriptionJson);
      console.log(isSubscriberAlready, subscription);
      if (!isSubscriberAlready) {
        handleSubscription(subscription, sessionId);
      } else {
        setModalButton('Info');
        setModalBody(<Alert color="success">Already subscribed!</Alert>);
        setModalButton(
          <Button color="secondary" onClick={() => router.push(`/creators/${handle}/success`)}>
            Ok
          </Button>
        );
        setModal(true);
        setLoading(false);
      }
    }
  };

  const handleSubscription = (subscription, sessionId) => {
    const { latest_invoice } = subscription;
    const { payment_intent } = latest_invoice;
    console.log(latest_invoice, subscription.status);
    if (payment_intent) {
      const { client_secret, status } = payment_intent;
      if (status === 'requires_action' || status === 'requires_confirmation') {
        stripe.confirmCardPayment(client_secret).then((result) => {
          if (result.error) {
            // The card was declined (i.e. insufficient funds, card has expired, etc)
            setModalTitle('Error');
            setModalBody(result.error.message);
            setModalButton(
              <Button color="secondary" onClick={() => setModal(false)}>
                Try Again
              </Button>
            );
            setModal(true);
            setLoading(false);
          } else {
            // Success!
            createUserSubscription(subscription.id, sessionId).then((userSub) => {
              router.push(`/creators/${handle}/success`);
            });
          }
        });
      } else {
        // No additional information was needed
        createUserSubscription(subscription.id, sessionId).then((userSub) => {
          router.push(`/creators/${handle}/success`);
        });
      }
    } else if (subscription.status === 'trialing') {
      createUserSubscription(subscription.id, sessionId).then((userSub) => {
        router.push(`/creators/${handle}/success`);
      });
    } else {
      console.log('handleSubscription:: No payment information received!');
      setLoading(false);
    }
  };

  const createUserSubscription = async (subscriptionId, sessionId) => {
    const response = await axios.post(
      '/api/sundae/subscription/subscribeToSundae',
      {
        subscriptionId,
        sessionId,
      }
    );

    console.log(response);
    return response;
  };

  const cardOptions = {
    iconStyle: 'solid',
    style: {
      base: {
        iconColor: '#1890ff',
        color: 'rgba(0, 0, 0, 0.65)',
        fontWeight: 500,
        fontFamily: 'Segoe UI, Roboto, Open Sans, , sans-serif',
        fontSize: '15px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': { color: '#fce883' },
        '::placeholder': { color: '#bfbfbf' },
      },
      invalid: {
        iconColor: '#ffc7ee',
        color: '#ffc7ee',
      },
    },
  };
  return (
    <div className={styles.form_element_container}>
      <Form
        onSubmit={(e) => {
          console.log(e);
          handleSubmit(e);
        }}
      >
        <FormGroup>
          <Label for="formName">Name on card</Label>
          <Input
            type="name"
            name="name"
            id="formName"
            placeholder="Jane Doe"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="formCard">Card</Label>
          <div className={styles.stripe_input}>
            <CardElement options={cardOptions} />
          </div>
        </FormGroup>
        <p>
          By subscribing, you agree with Sundae’s
          {' '}
          <a href="https://www.getsundae.com/tos">Terms of Service</a>
          {' '}
          and
          {' '}
          <a href="https://www.getsundae.com/privacy">Privacy Policy</a>
        </p>
        <div className={styles.btn_container}>
          {isLoading ? (
            <Spinner />
          )
            : (
              <button
                className={styles.stripe_btn}
                type="submit"
                disabled={!stripe}
              >
                Submit
              </button>
            )}
        </div>
      </Form>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
        <ModalBody>
          {modalBody}
        </ModalBody>
        <ModalFooter>
          {modalButton}
        </ModalFooter>
      </Modal>
    </div>
  );
};
export default CheckoutForm;

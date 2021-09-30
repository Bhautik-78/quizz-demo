import React from 'react';
import App from 'next/app';
import { Provider } from 'next-auth/client';
import Head from 'next/head';
import * as Sentry from '@sentry/browser';
import { CaptureConsole } from '@sentry/integrations';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../styles/globals.scss';

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://6ea8bf10635643af9439e4cceb09c6d3@o147028.ingest.sentry.io/5747109',
    integrations: [
      new CaptureConsole({
        levels: ['error'],
      }),
    ],
  });
}

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });

      Sentry.captureException(error);
    });

    super.componentDidCatch(error, errorInfo);
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Provider session={pageProps.session}>
        <Head>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
          <link
            href='https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Poppins:wght@100;200;500&family=Satisfy&display=swap'
            rel='stylesheet'
          />
          <title>Sundaeweb</title>
        </Head>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default MyApp;

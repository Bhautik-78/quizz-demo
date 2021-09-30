import React, {  useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/client';
import styles from '../styles/home.module.scss';
import Layout from '../Components/Layout/Layout';

const Landing = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  useEffect(() => {
    console.log(session, 'session');
  }, [session]);

  if (typeof window !== 'undefined' && loading) {
    return null;
  }
  return (
    <Layout isHide>
      <div className={styles.home_container}>
        <div className={styles.login_container}>
          {!session ? (
            <div className={styles.login_items}>
              <div className={styles.logo_container}>
                <img src="https://millieapp.s3.amazonaws.com/assets/sundae.png" alt="alt" />
              </div>
              <div className={styles.title_container}>
                <h1>Sundae</h1>
              </div>
              <div className={styles.btn_container}>
                <button type="button" onClick={() => signIn('auth0')} className="btn btn-dark btn-block">
                  Login with Email
                </button>
                {/* <hr />
                <button type="button" onClick={() => signIn('facebook')} className="btn btn-dark btn-block">
                  Login with facebook
                </button> */}
              </div>
            </div>
          ) : (
            <div className={styles.profile_container}>
              <div className={styles.img_container}>
                <img src={session.user.sundaeUser.imageUrl} alt="profile" />
              </div>
              <div className={styles.title_container}>
                <h1>
                  {session.user.sundaeUser.firstName}
                  {' '}
                  {session.user.sundaeUser.lastName}
                </h1>
                <p>{session.user.email}</p>
              </div>
              <div className={styles.btn_section}>
                {session.user && session.user.sundaeUser.creator ? (
                  <button
                    type="button"
                    onClick={() => router.push('/series', null, { shallow: true })}
                    className="btn btn-dark"
                  >
                    Go to Creator Dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/subscriptions', null, { shallow: true })}
                    className="btn btn-dark"
                  >
                    Manage Subscriptions
                  </button>
                )}
                <button type="button" onClick={signOut} className="btn btn-danger">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ req, resolvedUrl }) {
  const subdomain = req.headers.host.split('.')[0];
  const curUrl = process.env.NEXTAUTH_URL.split('.')[0];
  if (req.headers.host === 'app.getcritq.com') {
    console.log(req.headers.host, 'Redirecting');
    return {
      redirect: {
        destination: process.env.NEXTAUTH_URL,
        permanent: true
      }
    };
  }
  if (!curUrl.includes(subdomain)) {
    if (resolvedUrl === '/') {
      return {
        redirect: {
          destination: `${process.env.NEXTAUTH_URL}/creators/${subdomain}`,
          permanent: false
        }
      };
    }
  }
  return {
    props: {}
  };
}

export default Landing;

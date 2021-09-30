import axios from 'axios';
import * as userApi from '../../pages/api/sundae/accounts/user';

export async function signIn(user, account, metadata) {
  if (account.provider === 'facebook') {
    const query = `mutation {
        login(code: "${account.accessToken}"
          loginData: {
            loginType: FACEBOOK
          }) {
            sessionId
            user {
              id
              firstName
              lastName
              email
              imageUrl
              handle
              creator {
                id
              }
            }
          }
      }`;
    const resp = await axios.post(process.env.BACKEND_URL, {
      query
    });
    const { data } = resp.data;
    user.sundaeUser = data.login.user;
    user.sessionId = data.login.sessionId;
    // console.log("signin", user);
    return true;
  }
  if (account.provider === 'auth0') {
    const query = `mutation {
      login(code: ""
        loginData: {
          loginType: EMAIL
          auth0Token: "${account.accessToken}"
        }) {
          sessionId
          user {
            id
            firstName
            lastName
            email
            imageUrl
            handle
            creator {
              id
            }
          }
        }
    }`;
    const resp = await axios.post(process.env.BACKEND_URL, {
      query
    });
    const { data } = resp.data;
    user.sundaeUser = data.login.user;
    user.sessionId = data.login.sessionId;
    return true;
  }
  if (account.provider === 'auth0') {
    const query = `mutation {
      login(code: ""
        loginData: {
          loginType: EMAIL
          auth0Token: "${account.accessToken}"
        }) {
          sessionId
          user {
            id
            firstName
            lastName
            email
            imageUrl
            handle
            creator {
              id
            }
          }
        }
    }`;
    const resp = await axios.post(process.env.BACKEND_URL, {
      query
    });
    const { data } = resp.data;
    user.sundaeUser = data.login.user;
    user.sessionId = data.login.sessionId;
    return true;
  }

  return false;
}

export async function jwt(token, user) {
  if (user) {
    token = { ...user };
  }
  const userData = await userApi.user(token.sundaeUser.id, token.sessionId);
  if (userData.user) {
    token.sundaeUser = userData.user;
  }
  return token;
}

export async function session(session, token) {
  session.user = token;
  // console.log('session()', session);
  return session;
}

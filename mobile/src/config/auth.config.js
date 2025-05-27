import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig.extra.API_URL;

export const GOOGLE_CONFIG = {
  clientId: '294650718086-qm6uti6aq4av83vmvl59p92lqp9t18c0.apps.googleusercontent.com',
  redirectUri: API_URL + '/auth/google/callback',
  scopes: ['profile', 'email'],
};

export const FACEBOOK_CONFIG = {
  clientId: '1477151556603208',
  redirectUri: API_URL + '/auth/facebook/callback',
  scopes: ['email'],
};

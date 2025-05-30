import admin from 'firebase-admin';

const serviceAccount = {
  type: "service_account",
  project_id: "refind-dbebc",
  private_key_id: "9adb58c8e0493145a97d27d9bbdca8de60e3e0d8",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCz9XC4gPJ2Mr+k\n9VBBfco4WOQdcr7bhYuAU8vbONzcvlozVl3Tn/r7CDrr04yK7c6qlt+fSijlUENR\nV25xeuuB4EhCnzGFN5ZVRYuqQRKJcKzroALWOWkYk46xy5Q9cx4rS5ghV0D+md7D\nQCKExY9nQoNum6Av4NkV5wwOStyCQjFJeloU3X8yNl9QVO24lUdM3eXWJ5N3snvn\nMkCVdAYrJjgaH9TmhQIvsPiAZHWnGJDr6DanAdceHSrUv5doqw/h8ihAmc+OarPM\nVy5QKKoGu39CDfkrARzZzqJBdKetoi1fAIJcg4Ilf56KXstt89FzOufsUjYAp4BH\nbb7afaC3AgMBAAECggEAUN+6PyiwDj+DUfJvFWefFBCav8M8E7Kh/VNrV4Nn+opP\nRigHtZ39cIiD1ky1qg/yY0a3i8ILu/aEsk8NEtGveigdwVcCrcBL/tloyWRCHOM2\nyxOXgse9O+7AX5XCcpVEFyf7X+xzCJiE/JFbkfipGDpTj8c/x5SQat/xUpEBJUYx\n+1V4AQAiUIIuqIzi0OaGXmTcQ3yeVsatNU0lxkerwHSCzJz7CaAYUNIRL2rdlaaD\nA5lKyJjZO2O32IyOzKKv3MYWOWyCZhRofbBxEnkl8XgcPF7zNcvST7RXMJFpoyIH\n2cN1arLnLWmH3N9f95+ZrIM7E4R04wBe5Ukfi4NSNQKBgQDgiUH4CdEeG6NIA4aV\ntCAk4cL3TFbCPHd4wQsqQ/VJgNCH3c5KgKuFjklBwYVOFMV1k4TOoLSMc1z7xbIi\n1MSKf2IWi3BvAMU3XyexKxzDhUfJBNF1ir6dubK6/UixbxU8u8N4PoTpViowBSDl\nPXFQXKZSxjAf1h2Pt12ro++QxQKBgQDNLRDWAdnfMthfiXHzDa5dRJxhOuggVnvp\nNUPRW2DYVK6Nhe/fQJBxx4DF0U10nw/Wmpr4gflu4CnLH/+Vlo9x6lTnK0rDuBhl\nwukaeWv6TPO75vVW3nRuU/bDeCCFgCFDnOdV0GhEI4WyH4AUx0aOu81o7khcywZk\nYJ81AZrLSwKBgQCOSg0XHUl69fK8QRe5qMMx/CtsQeE9B8qCKHtl1lkLsmjzoLkI\n9486fJep5vQOLhWP0+M2ehrQYo8LMhYYApNmXSEQvl6KyYcw9skVegepU73RAo+m\nGD2BgFtmKfo2Dvn7WdWeTqg1ohfsBGP7QbucPIpeLB/1HN/w4jem/KVlLQKBgCcX\nyhhsm92aK33wi0SbO7jLpNwlxCq9L7jcjEJsncQ6RlPyzCSGgb8cGx4V5iMtV3A1\nXwewhB0rGut3+lO/Ly+uTWUKa6FlB0kEXTPNJNS5KsuHkwFtO1P2LZNK5S9qnWvr\njmxcXDF3bzbkJ5xN59S0VcwDcsgzatFfU5Ze6uaHAoGAI4tdaOLNczqAuvHclTLY\nvIJIiXdqJEPaMgbeAwX1cBEAG1vrRzQEudsw3/oNS89rw8wkRcoa8a/KvelA3q8x\ntGmpTrHoCc/MRELORxcubIKJkE07YM+pXPOy5fEeGDTs/0/VKBBk77UinOiF4ZPt\nMsssAtwJPHdTx0lKtQ4s4aw=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@refind-dbebc.iam.gserviceaccount.com",
  client_id: "102643044731652966602",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40refind-dbebc.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Ініціалізація Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "refind-dbebc.firebasestorage.app"
    });
    console.log('✅ Firebase Admin успішно ініціалізовано');
  } catch (error) {
    console.error('❌ Помилка ініціалізації Firebase Admin:', error);
    throw error;
  }
}

export default admin;
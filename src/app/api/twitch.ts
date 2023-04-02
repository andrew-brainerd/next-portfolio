import { TwitchAuth } from 'types/twitch';

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;

export const fetchTwitchAuth = async (): Promise<TwitchAuth> => {
  const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

  try {
    const data = await fetch(authUrl, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    });

    const { access_token: token, expires_in: expiration } = await data.json();

    if (!data.ok) {
      console.error('Error fetching Twitch auth');
    }

    return { token, expiration };
  } catch (error) {
    return new Promise(res => res({ token: '', expiration: 0 }));
  }
};

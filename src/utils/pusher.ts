import Pusher from 'pusher-js';

let pusher: Pusher;

const getPusher = () => {
  if (!pusher) {
    pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
      cluster: 'us2'
    });
  }
  return pusher;
};

export const getChannel = (channel: string) => getPusher().subscribe(channel);

export const leaveChannel = (channel: string) => getPusher().unsubscribe(channel);

export const onPusherReconnect = (handler: () => void) => {
  const pusher = getPusher();
  pusher.connection.bind('connected', handler);
  return () => pusher.connection.unbind('connected', handler);
};

'use client';

import { Player } from '@lottiefiles/react-lottie-player';
import loading from './loading.json';

import styles from 'styles/components/Loading.module.scss';

interface LoadingProps {
  message?: string;
  size?: number;
}

const Loading = ({ message, size = 100 }: LoadingProps) => {
  return (
    <div className={styles.loading}>
      {message && <div className={styles.message}>{message}</div>}
      <Player autoplay loop src={loading} style={{ height: size, width: size }} />
    </div>
  );
};

export default Loading;

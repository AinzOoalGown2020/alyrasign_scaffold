import { useEffect, useState } from 'react'
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import { XIcon } from '@heroicons/react/solid'
import useNotificationStore from '../stores/useNotificationStore'
import { useConnection } from '@solana/wallet-adapter-react';
import { getExplorerUrl } from '../utils/explorer'
import { useNetworkConfiguration } from '../contexts/NetworkConfigurationProvider';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  description?: string;
  txid?: string;
  onHide?: () => void;
}

const NotificationList = () => {
  const { notifications, set: setNotificationStore } = useNotificationStore((s: any) => s);

  const reversedNotifications = [...notifications].reverse();

  return (
    <div className={`z-20 fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6`}>
      <div className={`flex flex-col w-full max-w-sm`}>
        {reversedNotifications.map((n, i) => (
          <Notification
            key={`${n.message}${i}`}
            type={n.type}
            message={n.message}
            description={n.description}
            txid={n.txid}
            onHide={() => {
              if (setNotificationStore) {
                setNotificationStore((state: any) => ({
                  notifications: state.notifications.filter((j: any) => j !== n),
                }));
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Notification = ({ type, message, description, txid, onHide }: NotificationProps) => {
  const { networkConfiguration } = useNetworkConfiguration();

  useEffect(() => {
    const id = setTimeout(() => {
      if (onHide) {
        onHide()
      }
    }, 8000);

    return () => {
      clearInterval(id);
    };
  }, [onHide]);

  return (
    <div className={`max-w-sm w-full bg-bkg-1 shadow-lg rounded-md mt-2 pointer-events-auto ring-1 ring-black ring-opacity-5 p-2 mx-4 mb-12 overflow-hidden`}>
      <div className={`p-4`}>
        <div className={`flex items-center`}>
          <div className={`flex-shrink-0`}>
            {type === 'success' ? (
              <CheckCircleIcon className={`h-8 w-8 mr-1 text-green`} />
            ) : null}
            {type === 'info' && <InformationCircleIcon className={`h-8 w-8 mr-1 text-red`} />}
            {type === 'error' && (
              <XCircleIcon className={`h-8 w-8 mr-1`} />
            )}
          </div>
          <div className={`ml-2 w-0 flex-1`}>
            <div className={`font-bold text-fgd-1`}>{message}</div>
            {description ? (
              <p className={`mt-0.5 text-sm text-fgd-2`}>{description}</p>
            ) : null}
            {txid ? (
              <div className="flex flex-row">
                <a
                  href={getExplorerUrl(txid, networkConfiguration)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-row link text-primary hover:text-primary-dark"
                >
                  <svg className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  <div className="flex mx-4">{txid.slice(0, 8)}...
                    {txid.slice(txid.length - 8)}
                  </div>
                </a>
              </div>
            ) : null}
          </div>
          <div className={`ml-4 flex-shrink-0 self-start flex`}>
            <button
              onClick={() => onHide && onHide()}
              className={`bg-bkg-2 default-transition rounded-md inline-flex text-fgd-3 hover:text-fgd-4 focus:outline-none`}
            >
              <span className={`sr-only`}>Close</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationList;

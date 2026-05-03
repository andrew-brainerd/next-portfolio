'use client';

import { useEffect, useRef, useState } from 'react';
import { sendInvitation, getInviteLink } from '@/api/rollWithMe';
import { Modal } from './Modal';

type InviteTab = 'link' | 'sms' | 'email';

interface InviteModalProps {
  isOpen: boolean;
  gameId: string;
  closeModal: () => void;
}

export const InviteModal = ({ isOpen, gameId, closeModal }: InviteModalProps) => {
  const [activeTab, setActiveTab] = useState<InviteTab>('link');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || inviteLink || !gameId) return;
    getInviteLink(gameId).then(data => {
      if (data?.inviteLink) setInviteLink(data.inviteLink);
    });
  }, [isOpen, inviteLink, gameId]);

  const handleSmsInvite = async () => {
    if (!phoneNumber) return;
    await sendInvitation(gameId, 'sms', phoneNumber);
    setPhoneNumber('');
    closeModal();
  };

  const handleEmailInvite = async () => {
    if (!email) return;
    await sendInvitation(gameId, 'email', email);
    setEmail('');
    closeModal();
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const tabClass = (tab: InviteTab) =>
    `flex items-center flex-col gap-1 p-3 w-24 rounded-md border cursor-pointer transition-all duration-150 ${
      activeTab === tab
        ? 'bg-neutral-700 border-brand-400 text-brand-400'
        : 'bg-neutral-800 border-transparent text-neutral-400 hover:bg-neutral-700 hover:text-white'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <div className="bg-neutral-800 rounded-xl p-6 max-w-md w-[90%]">
        <div className="text-xl mb-5 text-center select-none">
          Invite to <span className="text-brand-400">Roll With Me</span>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          <button className={tabClass('link')} onClick={() => setActiveTab('link')} type="button">
            <span className="text-xl">🔗</span>
            <span className="text-xs uppercase">Link</span>
          </button>
          <button className={tabClass('sms')} onClick={() => setActiveTab('sms')} type="button">
            <span className="text-xl">💬</span>
            <span className="text-xs uppercase">SMS</span>
          </button>
          <button className={tabClass('email')} onClick={() => setActiveTab('email')} type="button">
            <span className="text-xl">📧</span>
            <span className="text-xs uppercase">Email</span>
          </button>
        </div>

        <div>
          {activeTab === 'link' && (
            <div className="flex gap-2">
              <input
                ref={linkInputRef}
                className="bg-neutral-900 border border-neutral-600 rounded-md text-white outline-none py-2.5 px-2 flex-1 text-sm min-w-0 overflow-hidden text-ellipsis"
                type="text"
                value={inviteLink}
                readOnly
                onFocus={() => linkInputRef.current?.select()}
              />
              <button
                className="bg-brand-500 text-white text-sm py-2 px-4 rounded-md whitespace-nowrap hover:bg-brand-400 cursor-pointer"
                onClick={handleCopyLink}
                type="button"
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="flex flex-col gap-3">
              <input
                className="bg-neutral-900 border border-neutral-600 rounded-md text-white outline-none py-2.5 px-2 text-base w-full focus:border-brand-400"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSmsInvite()}
                autoFocus
              />
              <button
                className="bg-brand-500 text-white text-sm p-2.5 w-full rounded-md hover:bg-brand-400 cursor-pointer"
                onClick={handleSmsInvite}
                type="button"
              >
                Send SMS
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="flex flex-col gap-3">
              <input
                className="bg-neutral-900 border border-neutral-600 rounded-md text-white outline-none py-2.5 px-2 text-base w-full focus:border-brand-400"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailInvite()}
                autoFocus
              />
              <button
                className="bg-brand-500 text-white text-sm p-2.5 w-full rounded-md hover:bg-brand-400 cursor-pointer"
                onClick={handleEmailInvite}
                type="button"
              >
                Send Email
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

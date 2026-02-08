"use client";
import dynamic from 'next/dynamic';
import AuthProtection from '../components/AuthProtection';

import EditProfileSkeleton from '../components/EditProfileSkeleton';

const EditableProfileForm = dynamic(() => import('../profile/EditableProfileForm'), {
  // ssr: false removed to improve LCP
  loading: () => <EditProfileSkeleton />
});

export default function EditProfilePage() {
  return (
    <AuthProtection>
      <EditableProfileForm />
    </AuthProtection>
  );
}

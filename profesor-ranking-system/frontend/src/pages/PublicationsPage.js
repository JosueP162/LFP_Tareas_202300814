import React, { useState } from 'react';
import { useAuth } from '../utils/auth';
import PublicationsList from '../components/publications/PublicationList';
import CreatePublication from '../components/publications/CreatePublication';

const PublicationsPage = () => {
  const { isAuthenticated } = useAuth();
  const [refreshPublications, setRefreshPublications] = useState(0);

  const handlePublicationCreated = () => {
    setRefreshPublications(prev => prev + 1);
  };

  return (
    <div>
      {isAuthenticated && (
        <CreatePublication onPublicationCreated={handlePublicationCreated} />
      )}
      
      <PublicationsList key={refreshPublications} />
    </div>
  );
};

export default PublicationsPage;
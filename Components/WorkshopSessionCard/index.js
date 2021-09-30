import React from 'react';
import { useRouter } from 'next/router';

const WorkshopSessionCard = ({ workshopId, workshopTitle,
workshopSession }) => {
  const router = useRouter();

  return (
    <div>
      {workshopSession.title}
    </div>
  );
};

export default WorkshopSessionCard;

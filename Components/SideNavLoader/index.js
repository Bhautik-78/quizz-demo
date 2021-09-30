import React from 'react';
import ContentLoader from 'react-content-loader';

const SideNavLoader = (props) => (
  <ContentLoader
    speed={2}
    width={400}
    height={150}
    viewBox="0 0 400 150"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="25" y="15" rx="5" ry="5" width="260" height="10" />
    <rect x="25" y="45" rx="5" ry="5" width="260" height="10" />
    <rect x="25" y="75" rx="5" ry="5" width="260" height="10" />
    <rect x="25" y="105" rx="5" ry="5" width="260" height="10" />
  </ContentLoader>
);

export default SideNavLoader;

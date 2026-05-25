import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = 'DomeLink', 
  description = 'Architectural intelligence for premium projects.', 
  image = 'http://localhost:3000/api/seo/og-image', 
  url = 'http://localhost:8080' 
}) => {
  const fullTitle = title === 'DomeLink' ? title : `${title} | DomeLink`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${image}?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${image}?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`} />
    </Helmet>
  );
};

export default SEO;

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 mt-8 text-gray-400 bg-gray-800">
      <div className="mx-auto text-center max-w-7xl">
        <p>&copy; {new Date().getFullYear()} Strbull Server Audits. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

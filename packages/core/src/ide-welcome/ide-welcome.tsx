import React from 'react';
import './ide-welcome.less';

export const IDEWelcome: React.FC<unknown> = () => {
  return (
    <section className="ide-welcome">
      <div className="ide-welcome-main">
        <h1>Smart Contract IDE</h1>
        <p>Editing evolved</p>
      </div>
    </section>
  );
};
IDEWelcome.displayName = 'IDEWelcome';
IDEWelcome.defaultProps = {};

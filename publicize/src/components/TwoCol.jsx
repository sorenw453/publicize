import React from 'react';

const TwoCol = ({ children }) => {
  const left = React.Children.toArray(children).find(
    (child) => child.type?.displayName === 'Left'
  );
  const right = React.Children.toArray(children).find(
    (child) => child.type?.displayName === 'Right'
  );

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-base-200 p-8 rounded-lg shadow-md m-8 gap-10 min-h-[18rem]">
      <div className="md:w-1/2">{left}</div>
      <div className="md:w-1/2">{right}</div>
    </div>
  );
};

export const Left = ({ children }) => <>{children}</>;
Left.displayName = 'Left';

export const Right = ({ children }) => <>{children}</>;
Right.displayName = 'Right';

export default TwoCol;

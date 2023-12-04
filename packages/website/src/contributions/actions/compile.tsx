import React from 'react';
import { IToolbarActionElementProps, useInjectable } from '@opensumi/ide-core-browser';
import { Button } from '@opensumi/ide-components';

export const Compile: React.FC<IToolbarActionElementProps> = () => {
  // const {} = useInjectable();

  return (
    <Button size="small" type="default">
      编译
    </Button>
  );
};

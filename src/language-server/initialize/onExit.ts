import { FOnExit } from '../types';

export const onExit: FOnExit = (_state) => () => {
  console.log('Solidity Language Server exited.');
};

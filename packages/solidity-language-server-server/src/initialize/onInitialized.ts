import { FOnInitialized } from '../types';

export const onInitialized: FOnInitialized = (_state) => () => {
  console.log('Solidity Language Server initialized.');
  console.log(_state.connection);
};

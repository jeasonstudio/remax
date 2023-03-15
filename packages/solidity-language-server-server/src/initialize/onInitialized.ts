import { FOnInitialized } from '../types';

export const onInitialized: FOnInitialized = (_state) => async () => {
  console.log('Solidity Language Server initialized.');
  // _state.connection.workspace
};

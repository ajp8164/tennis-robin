import { MigrationManifest } from 'redux-persist';
// import { StoreState } from 'store/initialStoreState';

// Redux store migrations handled by redux-persist.
// Each key in the manifest represents all the changes required to migrate from
// key value -1 to key value (i.e. 0 represents migration from v -1 to v 0). Migrations
// are executed in order if the store is more than one version behind.
//
// Return the new state given the old state. Redux Persist calls each migration with
// the old (pre-migration) store state. The return value is the new store state at the
// store version identified by the manifest key value (e.g. 0).
//
// The persistConfig must specify the current (target) store `version`. Available migrations
// are called to upgrade the store to the target version. See ./index.ts for persistConfig{}.
//
// Example: Given the following the app will run with store state version 2. If the app launches
// with store state version 0 then migrations will occur in order 0 to 1 then 1 to 2.
//
//   persistConfig = {
//      version: 2,
//      ...
//   }
//
// See https://github.com/rt2zz/redux-persist?tab=readme-ov-file#migrations
// See https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react/
export const migrations: MigrationManifest = {
  // Example
  //
  // 1: (state: StoreState) => {
  //   // Changes:
  //   // - Add appSettings.loanSettings
  //   return {
  //     ...state,
  //     appSettings: {
  //       ...state.appSettings,
  //       loanSettings: {
  //         loanAmount: 200000,
  //       },
  //     },
  //   };
};

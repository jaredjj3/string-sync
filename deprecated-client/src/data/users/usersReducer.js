import { handleActions, combineActions } from 'redux-actions';
import { usersActions as actions, usersDefaultState as defaultState } from './';

const usersReducer = handleActions({
  [combineActions(actions.users.index.set)]: (state, action) => ({
    ...state
  }),
  [combineActions(actions.users.show.set)]: (state, action) => ({
    ...state
  }),
  [combineActions(actions.users.edit.set)]: (state, action) => ({
    ...state
  }),
  [combineActions(actions.users.edit.update)]: (state, action) => ({
    ...state
  })
}, defaultState);

export default usersReducer;

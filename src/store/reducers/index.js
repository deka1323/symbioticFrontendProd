import { combineReducers } from 'redux';
import pigReducer from './pigReducer';

const rootReducer = combineReducers({
  pig: pigReducer
});

export default rootReducer;
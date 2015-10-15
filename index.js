import React, { Component, PropTypes } from 'react';
import { combineReducers, createStore, bindActionCreators} from 'redux';

// -----------------------------------------------------------------------------

// counter action creators
const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

function decrement() {
  return {
    type: DECREMENT_COUNTER
  };
}

// counter reducer
function count(state = 0, action) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return state + 1;
    case DECREMENT_COUNTER:
      return state - 1;
    default:
      return state;
  }
}

// counter component
class Counter extends Component {
  componentWillMount() {
    const {increment, decrement} = this.props;
    this.actions = bindActionCreators(
      {increment, decrement},
      this.props.dispatch
    )
  }
  render() {
    const { count } = this.props;
    return (
      <p>
        Clicked: {count} times
        {' '}
        <button onClick={this.actions.increment}>+</button>
        {' '}
        <button onClick={this.actions.decrement}>-</button>
      </p>
    );
  }
}

// -----------------------------------------------------------------------------

// nest the action behind another action
const liftActionCreator = liftingAction => actionCreator => action => Object.assign({}, liftingAction, { nextAction: actionCreator(action) })
// a lifting reducer will consume the first action and apply the next reducer to the state
const liftReducer = liftingReducer => reducer => (state, action) => liftingReducer(state, action)((subState) => reducer(subState, action.nextAction))

// -----------------------------------------------------------------------------

// list actions
const LIST_INDEX = 'LIST_INDEX'
function actOnIndex(i) {
  return {
    type: LIST_INDEX,
    index: i
  }
}

// list high-order reducer
const list = (state=[], action) => (reduce) => {
  switch (action.type) {
    case LIST_INDEX:
      let nextState = state.slice(0)
      nextState[action.index] = reduce(nextState[action.index])
      return nextState
    default:
      return state;
  }
}

const reducer = combineReducers({
  counts: liftReducer(list)(count)
});

const store = createStore(reducer)

class App extends Component {
  render() {
    const counters = [0,1,2,3,4].map((i) => {
      return (
        <Counter count={this.props.state.counts[i]}
                 increment={liftActionCreator(actOnIndex(i))(increment)}
                 decrement={liftActionCreator(actOnIndex(i))(decrement)}
                 dispatch={this.props.dispatch}
                 key={i}/>
      )
    })
    return (
      <div>
        {counters}
      </div>
    );
  }
}

// -----------------------------------------------------------------------------

// connect component to store
class Connector extends Component {
  componentWillMount() {
    this.setState(this.props.store.getState())
    this.unsubscribe = this.props.store.subscribe(() => {
      this.setState(this.props.store.getState());
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    const Main = this.props.component;
    return <Main state={this.state} dispatch={this.props.store.dispatch}/>;
  }
}

React.render(
  <Connector store={store} component={App}/>,
  document.getElementById('root')
)

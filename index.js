import React, { Component, PropTypes } from 'react';
import { combineReducers, createStore, bindActionCreators} from 'redux';

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
  render() {
    const { increment, decrement, count } = this.props;
    return (
      <p>
        Clicked: {count} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
      </p>
    );
  }
}


const reducer = combineReducers({
  count
});

const store = createStore(reducer)


class App extends Component {
  componentWillMount() {
    this.actions = bindActionCreators(
      {increment, decrement},
      this.props.dispatch
    )
  }
  render() {
    return (
      <Counter count={this.props.state.count}
               increment={this.actions.increment}
               decrement={this.actions.decrement}/>
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

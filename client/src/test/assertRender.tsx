import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Root } from 'root';
import { createStore } from 'data';
import { xhrMock } from './mocks';
import { configure } from 'config';

const getTestComponent = (
  Component: React.ComponentClass | React.SFC,
  props: object,
  isRoot: boolean = false
): React.SFC => {
  if (isRoot) {
    return () => <Component {...props} />;
  } else {
    return () => (
      <Root store={createStore()}>
        <Component {...props} />
      </Root>
    );
  }
};

const assertRender = (
  Component: React.ComponentClass | React.SFC, props: object = {}, isRoot = false): void => {
  it('renders without crashing', () => {
    window.XMLHttpRequest = jest.fn(xhrMock);

    configure();
    const div = document.createElement('div');
    const TestComponent = getTestComponent(Component, props, isRoot);

    ReactDOM.render(<TestComponent />, div);
    ReactDOM.unmountComponentAtNode(div);
  })
};

export default assertRender;

import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose, setDisplayName, lifecycle } from 'recompose';
import { Layout } from 'antd';
import { Nav } from 'components';
import styled from 'react-emotion';
import { ViewportSync, SessionSync, Routes } from './';
import { pick, values } from 'lodash';

const enhance = compose(
  setDisplayName('App'),
  withRouter,
  lifecycle({
    componentDidMount() {
      // scroll to top on route change
      this.props.history.listen(() => window.scrollTo(null, 0));
    }
  })
);

const colors = ['primaryColor', 'secondaryColor', 'tertiaryColor'];

const Gradient = styled('div')`
  height: 2px;
  background: #FC354C;
  background: linear-gradient(to right, ${props => values(pick(props.theme, colors)).join(', ')});
`;

const LayoutHeader = styled(Layout.Header)`
  background: #fff;
  border-bottom: 1px solid #e8e8e8;

  && {
    padding: 0 20px;
  }
`;

const LayoutHeaderInner = styled('div')`
  max-width: 1200px;
  margin: 0 auto;
`;

const LayoutFooter = styled(Layout.Footer)`
  text-align: center;
`;

/**
 * This component sets the layout and routes of the app.
 */
const App = enhance(props => (
  <main className="app">
    <ViewportSync />
    <SessionSync />
    <Gradient />
    <Layout>
      <LayoutHeader>
        <LayoutHeaderInner>
          <Nav />
        </LayoutHeaderInner>
      </LayoutHeader>
      <Layout.Content>
        <Routes />
      </Layout.Content>
      <LayoutFooter>
        StringSync ©2018 Created by Jared Johnson
      </LayoutFooter>
    </Layout>
  </main>
));

export default App;

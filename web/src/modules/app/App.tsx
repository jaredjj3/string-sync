import React from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';
import StoreViewportSync from '../../components/store-viewport-sync/StoreViewportSync';
import Header from './Header';
import Content from './Content';
import Footer from './Footer';

const StyledLayout = styled(Layout)`
  height: 100vh;
`;

interface Props {}

const App: React.FC<Props> = (props) => {
  return (
    <>
      <StoreViewportSync />
      <StyledLayout>
        <Header />
        <Content />
        <Footer />
      </StyledLayout>
    </>
  );
};

export default App;

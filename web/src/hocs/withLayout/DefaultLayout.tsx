import { Col, Layout, Row } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Logo } from '../../components/Logo';
import { Wordmark } from '../../components/Wordmark';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { RootState } from '../../store';
import { Menu } from './Menu';

const StyledLayout = styled(Layout)`
  && {
    min-height: 100vh;
  }
`;

const StyledHeader = styled(Layout.Header)`
  && {
    background: #ffffff;
    border-bottom: 1px solid #e8e8e8;
    padding: 0 16px;
    display: flex;
    align-items: center;
  }
`;

const StyledFooter = styled(Layout.Footer)`
  text-align: center;
`;

const Lane = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const Offline = styled.em`
  font-weight: lighter;
  color: ${(props) => props.theme['@muted']};
`;

export const DefaultLayout: React.FC = (props) => {
  const isGtMdViewport = useSelector<RootState, boolean>(
    (state) => state.viewport.lg || state.viewport.xl || state.viewport.xxl
  );

  const isOnline = useOnlineStatus();
  const isWordmarkVisible = isOnline && isGtMdViewport;
  const isOfflineVisible = !isOnline;

  return (
    <StyledLayout data-testid="default-layout">
      <StyledHeader>
        <Lane>
          <Row align="middle" justify="space-between">
            <Col>
              <Link to="/library">
                <Row align="middle" gutter={8}>
                  <Col>
                    <Row align="middle">
                      <Logo size={22} />
                    </Row>
                  </Col>
                  {isWordmarkVisible && (
                    <Col>
                      <Wordmark />
                    </Col>
                  )}
                  {isOfflineVisible && (
                    <Col>
                      <Offline>offline</Offline>
                    </Col>
                  )}
                </Row>
              </Link>
            </Col>
            <Col>
              <Menu />
            </Col>
          </Row>
        </Lane>
      </StyledHeader>
      <Layout.Content>
        <Lane>{props.children}</Lane>
      </Layout.Content>
      {isGtMdViewport && (
        <StyledFooter>
          <Lane>StringSync LLC © 2020</Lane>
        </StyledFooter>
      )}
    </StyledLayout>
  );
};

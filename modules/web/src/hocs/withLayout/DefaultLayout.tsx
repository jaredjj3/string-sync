import React from 'react';
import { Layout, Row, Col, Divider } from 'antd';
import styled from 'styled-components';
import { Wordmark } from '../../components/Wordmark';
import { Logo } from '../../components/Logo';
import { Link } from 'react-router-dom';
import { Menu } from './Menu';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

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

export const DefaultLayout: React.FC = (props) => {
  const isLtEqMdViewport = useSelector<RootState, boolean>(
    (state) => state.viewport.xs || state.viewport.sm || state.viewport.md
  );

  return (
    <StyledLayout data-testid="default-layout">
      <StyledHeader>
        <Lane>
          <Row align="middle" justify="space-between">
            <Col>
              <Link to="library">
                <Row align="middle" justify="center">
                  <Logo size={22} />
                  {isLtEqMdViewport ? null : (
                    <>
                      <Divider type="vertical" />
                      <Wordmark />
                    </>
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
      {isLtEqMdViewport ? null : (
        <StyledFooter>
          <Lane>StringSync LLC © 2020</Lane>
        </StyledFooter>
      )}
    </StyledLayout>
  );
};

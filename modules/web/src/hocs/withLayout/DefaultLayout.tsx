import React from 'react';
import { Layout, Row, Col, Divider } from 'antd';
import styled from 'styled-components';
import { useSelector } from '../../hooks';
import { Wordmark } from '../../components/Wordmark';
import { Logo } from '../../components/Logo';
import { Link } from 'react-router-dom';
import { Menu } from './Menu';

const StyledLogo: any = styled(Logo)`
  font-size: 22px;
`;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Layout.Header)`
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 16px;
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
  const isLtEqMdViewport = useSelector((state) => state.viewport.xs || state.viewport.sm || state.viewport.md);

  return (
    <StyledLayout data-testid="default-layout">
      <StyledHeader>
        <Lane>
          <Row justify="space-between">
            <Col>
              <Link to="library">
                <StyledLogo />
                {isLtEqMdViewport ? null : (
                  <>
                    <Divider type="vertical" />
                    <Wordmark />
                  </>
                )}
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
          <Lane>StringSync LLC © 2019</Lane>
        </StyledFooter>
      )}
    </StyledLayout>
  );
};
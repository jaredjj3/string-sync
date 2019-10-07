import React, { useState, useCallback } from 'react';
import { Button, Row, Icon, Col, Modal, Avatar, List } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthUser } from '../../store/modules/auth';
import { logout } from '../../store/modules/auth/';

const MenuIcon = styled(Icon)`
  font-size: 20px;
  color: rgba(0, 0, 0, 0.65);

  :hover {
    color: ${(props) => props.theme['@primary-color']};
  }
`;

const Username = styled.div`
  font-size: 14px;
`;

const Role = styled.div`
  font-size: 12px;
  font-weight: lighter;
  color: ${(props) => props.theme['@muted']};
`;

interface Props {}

const Menu: React.FC<Props> = (props) => {
  const isLoggedIn = useSelector<RootState, boolean>(
    (state) => state.auth.isLoggedIn
  );
  const user = useSelector<RootState, AuthUser>((state) => state.auth.user);
  const isLtEqMdViewport = useSelector<RootState, boolean>((state) => {
    const { xs, sm, md } = state.viewport;
    return xs || sm || md;
  });
  const isGtEqTeacher = true; // TODO put real logic
  const dispatch = useDispatch();
  const [isModalVisible, setModalVisible] = useState(false);
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const handleLogoutClick = () => {
    dispatch(logout());
    hideModal();
  };

  const gutterPx = isLoggedIn ? 24 : 8;

  const isLibraryVisible = !isLtEqMdViewport && isLoggedIn;
  const isUploadVisible = !isLtEqMdViewport && isLoggedIn && isGtEqTeacher;
  const isLoginVisible = !isLoggedIn;
  const isSignupVisible = !isLoggedIn;
  const isSettingsVisible = isLoggedIn;

  return (
    <>
      <Row type="flex" justify="center" align="middle" gutter={gutterPx}>
        {isLibraryVisible ? (
          <Col>
            <Link to="library">
              <MenuIcon type="compass" />
            </Link>
          </Col>
        ) : null}

        {isUploadVisible ? (
          <Col>
            <Link to="upload">
              <MenuIcon type="upload" />
            </Link>
          </Col>
        ) : null}

        {isSettingsVisible ? (
          <Col>
            <MenuIcon type="user" onClick={showModal} />
          </Col>
        ) : null}

        {isLoginVisible ? (
          <Col>
            <Link to="login">
              <Button size="small" type="primary">
                login
              </Button>
            </Link>
          </Col>
        ) : null}

        {isSignupVisible ? (
          <Col>
            <Link to="signup">
              <Button size="small" type="link">
                signup
              </Button>
            </Link>
          </Col>
        ) : null}
      </Row>

      <Modal
        closable
        closeIcon={null}
        title={
          isLoggedIn ? (
            <Row type="flex" gutter={8}>
              <Col>
                <Avatar icon="user" />{' '}
              </Col>
              <Col>
                <div>
                  <Username>@{user.username}</Username>
                  <Role>admin</Role>
                </div>
              </Col>
            </Row>
          ) : null
        }
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
      >
        <Button block onClick={handleLogoutClick} disabled={!isLoggedIn}>
          logout
        </Button>
      </Modal>
    </>
  );
};

export default Menu;

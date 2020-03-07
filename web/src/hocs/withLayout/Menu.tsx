import React, { useState, useCallback } from 'react';
import { Button, Row, Icon, Col, Modal, Avatar, message } from 'antd';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { logout } from '../../store';
import { compareUserRoles } from '../../common';
import { useSelector } from '../../hooks';
import { useHistory } from 'react-router';

const MenuIcon = styled(Icon)`
  font-size: 22px;
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

export const Menu: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isLtEqMdViewport = useSelector((state) => {
    const { xs, sm, md } = state.viewport;
    return xs || sm || md;
  });
  const isAuthPending = useSelector((state) => state.auth.isPending);
  const user = useSelector((state) => state.auth.user);
  const history = useHistory();

  const isGtEqTeacher = compareUserRoles(user.role, 'teacher') >= 0;

  const [isModalVisible, setModalVisible] = useState(false);
  const showModal = useCallback(() => setModalVisible(true), [setModalVisible]);
  const hideModal = useCallback(() => setModalVisible(false), [
    setModalVisible,
  ]);

  const handleLogoutClick = () => {
    dispatch(logout());
    hideModal();
    message.success('logged out');
    history.push('library');
  };

  const gutterPx = isLoggedIn ? 16 : 8;

  const isLibraryVisible = !isAuthPending && !isLtEqMdViewport && isLoggedIn;
  const isUploadVisible =
    !isAuthPending && !isLtEqMdViewport && isLoggedIn && isGtEqTeacher;
  const isLoginVisible = !isAuthPending && !isLoggedIn;
  const isSignupVisible = !isAuthPending && !isLoggedIn;
  const isSettingsVisible = !isAuthPending && isLoggedIn;

  return (
    <>
      <Row type="flex" justify="center" align="middle" gutter={gutterPx}>
        {isLibraryVisible ? (
          <Col>
            <Button type="link" size="large" shape="circle">
              <Link to="library">
                <MenuIcon type="compass" />
              </Link>
            </Button>
          </Col>
        ) : null}

        {isUploadVisible ? (
          <Col>
            <Button type="link" size="large" shape="circle">
              <Link to="upload">
                <MenuIcon type="upload" />
              </Link>
            </Button>
          </Col>
        ) : null}

        {isSettingsVisible ? (
          <Col>
            <Button type="link" size="large" shape="circle" onClick={showModal}>
              <MenuIcon type="setting" />
            </Button>
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

      {isLoggedIn ? (
        <Modal
          closable
          closeIcon={null}
          title={
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
          }
          visible={isModalVisible}
          onCancel={hideModal}
          footer={null}
        >
          <Button block onClick={handleLogoutClick} disabled={!isLoggedIn}>
            logout
          </Button>
        </Modal>
      ) : null}
    </>
  );
};
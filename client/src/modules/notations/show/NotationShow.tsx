import * as React from 'react';
import { compose, withStateHandlers, withProps } from 'recompose';
import { RouteComponentProps } from 'react-router';
import { Loading } from '../../../components/loading/Loading';
import { withNotation, IWithNotationProps } from '../../../enhancers/withNotation';
import { Video } from '../../../components/video';
import { pick } from 'lodash';
import { Row } from 'antd';
import styled from 'react-emotion';
import { Menu } from './menu';
import { Controls } from '../../../components/video/controls';

type RouteProps = RouteComponentProps<{ id: string }>;

interface IStateProps {
  notationLoading: boolean;
  videoLoading: boolean;
  notationLoaded: () => void;
  videoLoaded: () => void;
}

interface ILoadingProps {
  loading: boolean;
}

type InnerProps = RouteProps & IStateProps & ILoadingProps & IWithNotationProps;

const enhance = compose<InnerProps, RouteComponentProps> (
  withStateHandlers(
    { notationLoading: true },
    { notationLoaded: () => () => ({ notationLoading: false }) }
  ),
  withStateHandlers(
    { videoLoading: true },
    { videoLoaded: () => () => ({ videoLoading: false }) }
  ),
  withProps<ILoadingProps, IStateProps>(props => ({
    loading: props.notationLoading || props.videoLoading
  })),
  withNotation<IStateProps & RouteProps>(
    props => parseInt(props.match.params.id, 10),
    props => props.notationLoaded(),
    props => props.history.push('/')
  )
);

const Bottom = styled('div')`
  width: 100%;
  position: fixed;
  bottom: 0;
  background: white;
  z-index: 2;
`;

const VideoWrapper = styled('div')`
  max-width: 53.33333vh;
  min-height: 200px;
  margin: 0 auto;

  iframe {
    width: 100%;
    min-height: 200px;
  }
`;

export const NotationShow = enhance(props => {
  const videoProps = {
    ...pick(props.notation.video, 'kind', 'src'),
    onReady: props.videoLoaded
  };

  return (
    <div>
      <Loading loading={props.loading} />
      <Menu />
      <div style={{ background: 'black' }}>
        <VideoWrapper>
          <Video {...videoProps} />
        </VideoWrapper>
      </div>
      <Row type="flex" justify="center">
        <div>Fretboard</div>
      </Row>
      <Row type="flex" justify="center">
        <div>Score</div>
      </Row>
      <Bottom>
        <Controls />
      </Bottom>
    </div>
  );
});

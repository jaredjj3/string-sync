import * as React from 'react';
import { compose, withStateHandlers, withProps } from 'recompose';
import { RouteComponentProps } from 'react-router';
import { Loading } from '../../../components/loading/Loading';
import { withNotation, IWithNotationProps } from '../../../enhancers/withNotation';
import { Video } from '../../../components/video/Video';
import { pick } from 'lodash';

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

export const NotationShow = enhance(props => {
  const videoProps = { ...pick(props.notation.video, 'kind', 'src'), onReady: props.videoLoaded };

  return (
    <div>
      <Loading loading={props.loading} />
      <Video {...videoProps} />
    </div>
  );
});

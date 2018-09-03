import * as React from 'react';
import { compose, lifecycle } from 'recompose';
import { connect, Dispatch } from 'react-redux';
import { MaestroActions } from '../../data/maestro/maestroActions';
import { loop } from 'enhancers/loop';
import { Time } from 'services';

interface IConnectProps {
  timeMs: number;
  videoPlayer: Youtube.IPlayer;
  setTimeMs: (timeMs: number) => void;
}

const enhance = compose<IConnectProps, {}>(
  connect(
    (state: Store.IState) => ({
      timeMs: state.maestro.timeMs,
      videoPlayer: state.video.player
    }),
    (dispatch: Dispatch) => ({
      setTimeMs: (timeMs: number) => dispatch(MaestroActions.setTimeMs(timeMs))
    })
  ),
  loop((props: IConnectProps) => {
    if (!props.videoPlayer) {
      return;
    }

    const time = new Time(props.videoPlayer.getCurrentTime(), 's');

    props.setTimeMs(time.ms);
  }),
  lifecycle<IConnectProps, {}>({
    componentWillUnmount() {
      this.props.setTimeMs(0);
    }
  })
)

/**
 * This component syncs time from the video player to the maestro store.
 */
export const TimeSync = enhance(() => null);

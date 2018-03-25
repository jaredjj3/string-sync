import React from 'react';
import styled from 'react-emotion';
import { NotationGrid, NotationSearch } from './';
import { compose, withProps, withHandlers, withState, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { BackTop } from 'antd';
import { indexIncludedObjects, camelCaseKeys } from 'utilities';
import { notationsActions } from 'data';

const enhance = compose(
  connect(
    state => ({
      fetchedAt: state.notations.index.fetchedAt,
      notations: state.notations.index.notations
    }),
    dispatch => ({
      setNotations: notations => dispatch(notationsActions.notations.index.set(notations))
    })
  ),
  withProps(props => {
    const tagOptions = new Set();
    props.notations.forEach(notation => {
      notation.relationships.tags.forEach(tag => tagOptions.add(tag.attributes.name));
    });
    return { tagOptions: Array.from(tagOptions).sort() }
  }),
  withState('queryString', 'setQueryString', ''),
  withState('queryTags', 'setQueryTags', new Set()),
  withProps(props => ({
    clearQueries: () => {
      props.setQueryString('');
      props.setQueryTags(new Set());
    }
  })),
  withHandlers({
    handleQueryStringChange: props => event => props.setQueryString(event.target.value),
    handleQueryTagsChange: props => tags => props.setQueryTags(tags)
  }),
  withProps(props => {
    const queryTags = Array.from(props.queryTags);
    const queryString = props.queryString.toUpperCase();

    // Do a first pass filtering by queryTag, then by queryString
    const queriedNotations = props.notations
      .filter(notation => {
        const notationTags = new Set(notation.relationships.tags.map(tag => tag.attributes.name));
        return queryTags.every(queryTag => notationTags.has(queryTag));
      })
      .filter(({ attributes, relationships }) => {
        const matchers = [
          attributes.artistName.toUpperCase(),
          attributes.songName.toUpperCase(),
          relationships.transcriber.attributes.name.toUpperCase()
        ]
        
        return matchers.some(matcher => matcher.includes(queryString))
      });

    return {
      queriedNotations
    }
  }),
  withProps(props => ({
    /**
     * Transforms the data from the notations index endpoint into notation objects
     * for the store.
     * 
     * @param {object} json 
     * @return {object}
     */
    getNotations(json) {
      const included = indexIncludedObjects(json.included);

      const notations = json.data.map(data => {
        const { id, attributes, links, relationships } = data;
        const tags = relationships.tags.data.map(({ id }) => included.tags[id]);
        const transcriber = included.users[relationships.transcriber.data.id];
        const video = included.videos[relationships.video.data.id];

        return camelCaseKeys({
          id,
          attributes,
          links,
          relationships: {
            tags,
            transcriber,
            video
          }
        }, true);
      });
      
      return notations;
    }
  })),
  lifecycle({
    async componentDidMount() {
      const response = await fetch('/api/v1/notations');
      const json = await response.json();
      const notations = this.props.getNotations(json);
      this.props.setNotations(notations);
    }
  })
);

const Outer = styled('div')`
  margin-top: 24px;
  max-width: 100%;
  overflow-x: hidden;
`;

const NotationIndex = enhance(props => (
  <Outer>
    <BackTop />
    <NotationSearch
      queryString={props.queryString}
      queryTags={props.queryTags}
      clearQueries={props.clearQueries}
      onQueryStringChange={props.handleQueryStringChange}
      onQueryTagsChange={props.handleQueryTagsChange}
      numQueried={props.queriedNotations.length}
      tagOptions={props.tagOptions}
    />
    <NotationGrid notations={props.queriedNotations} />
  </Outer>
));

export default NotationIndex;

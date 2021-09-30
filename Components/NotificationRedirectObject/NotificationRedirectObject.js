import React, { useEffect, useState } from 'react';
import {
  Row, Col, Spinner, Alert
} from 'reactstrap';
import axios from 'axios';
import styles from './notificationredirectobj.module.scss';

const NotificationRedirectObject = ({ callback, curRedirectObj }) => {
  const [curSelection, setSelection] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [searchError, setSearchErr] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!curRedirectObj) {
      setSelection(null);
    }
  }, [curRedirectObj]);

  const removeSelection = () => {
    setSelection(null);
    callback(null);
    setSearchResults(null);
  };

  const onSearch = async (event) => {
    event.preventDefault();
    const eventQ = event.target.value || '';
    setQuery(eventQ);
    const data = {
      query
    };
    console.log(data);
    setLoading(true);
    const results = await axios.post('/api/sundae/contentDiscovery/searchCreatorData', data);
    if (results.data.errorMessage) {
      console.log(results.data.errorMessage);
      setSearchErr(results.data.errorMessage);
    } else {
      setSearchResults(results.data);
    }
    setLoading(false);
  };

  const renderSearchResults = (results) => {
    if (results) {
      console.log(results);
      const { episodes, series } = results;
      if (episodes && episodes.length < 1
        && series && series.length < 1) {
        return (
          <div>
            {searchError ? <Alert color="danger">{searchError}</Alert> : ''}
            <br />
            {`No search results available for '${query}'`}
          </div>
        );
      }
      return (
        <div>
          {searchError ? <Alert color="danger">{searchError}</Alert> : ''}
          {episodes ? <h2>Episodes</h2> : null }
          <Row>
            {episodes.map((ep) => {
              const coverImage = ep.media[0];
              return (
                <Col key={ep.id} sm={12} md={3}>
                  <div
                    onClick={() => {
                      setSelection(ep);
                      callback({
                        type: 'EPISODE',
                        ...ep
                      });
                      setSearchResults(null);
                    }}
                    onKeyUp={() => {}}
                    tabIndex={0}
                    role="button"
                    className={styles.card_container}
                    style={{ maxWidth: '75%' }}
                  >
                    <div className={styles.img_container}>
                      <img src={coverImage.srcUrl} alt={ep.title} />
                    </div>
                    <div className={styles.title_container}>
                      <p>{ep.title}</p>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
          {series ? <h2>Series</h2> : null }
          <Row>
            {series.map((ser) => {
              const coverImage = ser.media[0];
              return (
                <Col key={ser.id} sm={12} md={3}>
                  <div
                    onClick={() => {
                      setSelection(ser);
                      callback({
                        type: 'SERIES',
                        ...ser
                      });
                      setSearchResults(null);
                    }}
                    onKeyUp={() => {}}
                    tabIndex={0}
                    role="button"
                    className={styles.card_container}
                    style={{ maxWidth: '75%' }}
                  >
                    <div className={styles.img_container}>
                      <img src={coverImage.srcUrl} alt={ser.title} />
                    </div>
                    <div className={styles.title_container}>
                      <p>{ser.title}</p>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      );
    }
    return '';
  };

  return (
    <div className="form-input-container">
      <label>Redirect To</label>
      {curSelection
        ? (
          <div className={styles.card_container}>
            <p onClick={removeSelection}>
              <img src="/Assets/trash.svg" alt="Remove" />
            </p>
            <div className={styles.img_container}>
              <img src={curSelection.media[0].srcUrl} alt={curSelection.title} />
            </div>
            <div className={styles.title_container}>
              <p>{curSelection.title}</p>
            </div>
          </div>
        )
        : (
          <input
            type="text"
            name="query"
            value={query}
            id="search-input"
            // className={styles.search_input}
            placeholder="Search an Episode/Series..."
            onChange={onSearch}
            onFocus={onSearch}
          />
        )}
      {renderSearchResults(searchResults)}
      {isLoading ? (
        <div>
          <br />
          <Spinner style={{ width: '3rem', height: '3rem' }} />
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default NotificationRedirectObject;

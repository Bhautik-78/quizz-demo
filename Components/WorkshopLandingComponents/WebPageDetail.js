import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './web.module.scss';
import { workshopThemes } from '../../Utils/workshoptheme';

const WebPageDetail = ({ data, pageStyles }) => {
  return (
    <div
      style={{ background: `${pageStyles?.midSecBg || workshopThemes[0].midSecBg}` }}
      className={styles.webpage_container}
    >
      <section className={styles.webpage_content}>
        <Row>
          <Col sm={12} md={6}>
            <section className={styles.left_sec}>
              <h1>{data?.title}</h1>
              <p>{data?.description}</p>
            </section>
          </Col>
          <Col sm={12} md={6}>
            <section className={styles.right_sec}>
              {data?.bullets.map((item, i) => {
                return (
                  <div key={`bullet_${i}`} className={styles.list_item}>
                    <img src={pageStyles?.midSecIcon || workshopThemes[0].midSecIcon} />
                    <p>{item?.text}</p>
                  </div>
                );
              })}
            </section>
          </Col>
        </Row>
      </section>
    </div>
  );
};

export default WebPageDetail;

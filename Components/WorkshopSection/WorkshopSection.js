import React, { useState } from 'react';
import { Collapse } from 'reactstrap';
import { EditorState, convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import styles from './workshop-sec.module.scss';
const WorkshopSection = ({ data }) => {
  const [workshopId, setWorkshopId] = useState('');
  return (
    <div className={styles.workshop_container}>
      <section className={styles.workshop_content_container}>
        <div className={styles.workshop_header}>
          <h1>{data?.title}</h1>
          <p>{data?.topDescription}</p>
        </div>
        <div className={styles.workshop_item_container}>
          {data
            ? data?.sessions?.map((item, i) => {
                return (
                  <div key={i} className={styles.workshop_item}>
                    <div
                      onClick={() =>
                        workshopId === i ? setWorkshopId('') : setWorkshopId(i)
                      }
                      className={styles.collapse_header}
                    >
                      <h6>{item.title}</h6>
                      {workshopId === i ? (
                        <img src='/Assets/landing/min.png' />
                      ) : (
                        <img src='/Assets/landing/add.png' />
                      )}
                    </div>
                    <Collapse isOpen={workshopId === i}>
                      <div className={styles.collapse_body}>
                        <div
                          // eslint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{
                            __html: stateToHTML(
                              EditorState.createWithContent(
                                convertFromRaw(JSON.parse(item.description))
                              ).getCurrentContent()
                            ),
                          }}
                        />
                      </div>
                    </Collapse>
                  </div> 
                );
              })
            : ''}
        </div>
        <div className={styles.workshop_footer}>
          <p>{data?.bottomDescription}</p>
        </div>
      </section>
    </div>
  );
};

export default WorkshopSection;

import React, { useState, useEffect } from 'react';
import {
  Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Spinner
} from 'reactstrap';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from './quizzCard.module.scss';

const QuizzCard = (props) => {
  const router = useRouter();

  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hiddenStyle, setHiddenStyle] = useState(null);
  const [seriesId, setSeriesId] = useState('');

  useEffect(() => {
    const seriesId = window.location.pathname.split('/')[2];
    setSeriesId(seriesId);
  }, []);

  const onQuizzCard = (item) => {
    router.push(`/series/${seriesId}/quizzes/${item.id}/question`);
  };

  const deleteQuizzes = async () => {
    setIsDeleting(true);
    const deleteResp = await axios.delete(`/api/sundae/quizzes/${props.quizzes.id}/delete`);
    setIsDeleting(false);
    toggleDeleteModal();
    if (deleteResp.data.errorMessage) {
      console.error(deleteResp.data.errorMessage);
    } else {
      setHiddenStyle({ display: 'none' });
    }
  };

  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  return (
    <Col sm={12} md={3}>
      <div className={styles.add_quizzes_btn_container} style={hiddenStyle}>
        <Modal centered isOpen={deleteModal} toggle={toggleDeleteModal}>
          <ModalHeader toggle={toggleDeleteModal}>Delete Series</ModalHeader>
          <ModalBody>
            Are you sure? This cannot be undone.
            <br />
            { isDeleting
              ? <Spinner style={{ width: '3rem', height: '3rem' }} /> : ''}
          </ModalBody>
          <ModalFooter>
            <Button disabled={isDeleting} color="danger" onClick={deleteQuizzes}>Delete</Button>
            {' '}
            <Button disabled={isDeleting} color="secondary" onClick={toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <div
          onClick={() => onQuizzCard(props.quizzes)}
        >
          <div className={styles.img_container}>
            <img src={props.quizzes.imageUrl} alt="addIcon" />
          </div>
          <div className={styles.title_container}>
            <p>{props.quizzes.title}</p>
          </div>
        </div>
        <p
          onClick={toggleDeleteModal}
        >
          <img src="/Assets/trash.svg" alt="Delete" />
        </p>
      </div>
    </Col>
  );
};

export default QuizzCard;

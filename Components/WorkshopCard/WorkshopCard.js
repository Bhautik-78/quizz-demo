import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  ModalFooter,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import styles from './workshopcard.module.scss';

const WorkshopCard = ({ workshop, coverImage }) => {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hiddenStyle, setHiddenStyle] = useState(null);

  const deleteWorkshop = async () => {
    setIsDeleting(true);
    const deleteResp = await axios.post(`/api/sundae/workshop/${workshop.id}/delete`);
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
    <div
      className={styles.workshopcard_container}
      style={hiddenStyle}
    >
      <Modal centered isOpen={deleteModal} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Delete Series</ModalHeader>
        <ModalBody>
          Are you sure? This cannot be undone.
          <br />
          { isDeleting
            ? <Spinner /> : ''}
        </ModalBody>
        <ModalFooter>
          <Button disabled={isDeleting} color="danger" onClick={deleteWorkshop}>Delete</Button>
          {' '}
          <Button disabled={isDeleting} color="secondary" onClick={toggleDeleteModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <div
        onClick={() => router.push(`/workshops/${workshop.id}/workshopsessions?title=${workshop.title}&handle=${workshop.handle}`)}
      >
        <div className={styles.img_container}>
          <img src={coverImage.srcUrl} alt={workshop.title} />
        </div>
        <div className={styles.title_container}>
          <p>{workshop.title}</p>
        </div>
      </div>
      <p
        onClick={toggleDeleteModal}
      >
        <img src="/Assets/trash.svg" alt="Delete" />
      </p>
    </div>
  );
};

export default WorkshopCard;

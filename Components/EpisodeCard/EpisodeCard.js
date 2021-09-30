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
import styles from './episodecard.module.scss';

const EpisodeCard = ({
  seriesId, seriesName, episode, coverImage
}) => {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hiddenStyle, setHiddenStyle] = useState(null);

  const deleteEpisode = async () => {
    setIsDeleting(true);
    const deleteResp = await axios.post(`/api/sundae/episode/${episode.id}/delete`);
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
      className={styles.card_container}
      style={hiddenStyle}
    >
      <Modal centered isOpen={deleteModal} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Delete Episode</ModalHeader>
        <ModalBody>
          Are you sure? This cannot be undone.
          { isDeleting
            ? <Spinner /> : ''}
        </ModalBody>
        <ModalFooter>
          <Button disabled={isDeleting} color="danger" onClick={deleteEpisode}>Delete</Button>
          {' '}
          <Button disabled={isDeleting} color="secondary" onClick={toggleDeleteModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <div onClick={() => router.push(`/series/${seriesId}/episodes/edit?episode=${episode.id}&series=${seriesName}`)}>
        <div className={styles.img_container}>
          <img src={coverImage.srcUrl} alt={episode.title} />
        </div>
        <div className={styles.title_container}>
          <p>{episode.title}</p>
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

export default EpisodeCard;

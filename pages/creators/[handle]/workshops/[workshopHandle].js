import React, { useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { ModalBody, Modal } from 'reactstrap';
import WorkshopSessions from '../../../../Components/WorkshopLandingComponents/SessionList';
import WebPageDetail from '../../../../Components/WorkshopLandingComponents/WebPageDetail';
import HeroHeader from '../../../../Components/WorkshopLandingComponents/HeroHeader';
import styles from './index.module.scss';
import { workshopThemes } from '../../../../Utils/workshoptheme';

const Workshop = ({ handle, workshopHandle }) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [serverErr, setServerErr] = useState(null);
  const [workshop, setWorkshop] = useState(null);
  const [pageTitle, setPageTitle] = useState('Workshop');
  const [showModal, setShowModal] = useState(false);
  const [creator, setCreator] = useState(null);

  const [pageStyles, setPageStyles] = useState(null);

  const [midSection, setMidSection] = useState(null);
  const previewMidSection = {
    title:'Why join this workshop? A small heading',
    description:'Why join this workshop? A short description',
    bullets:[{ text:'You will achieve greatness!' }]
  };

  const doSetLandingData = (data) => {
    console.log(JSON.parse(data), 'parsed');
    if (data) {
      setPageStyles(JSON.parse(data));
    } else {
      setPageStyles(workshopThemes[0]);
    }
  };

  useEffect(() => {
    if (workshop && router.query.isPreview !== 'true') {
      setShowModal(!workshop.isPublished);
    }
  }, [workshop, router.query.isPreview]);

  useEffect(() => {
    if (router.query.isPreview === 'true') {
      const data = JSON.parse(localStorage.getItem('workshopLanding'));
      console.log(data, 'yaka');
      setWorkshop(data);
      setMidSection(data?.webpageData);
      setPageStyles(data?.pageStyles);
      setLoading(false);
    } else {
      const getLandingByHandle = async () => {
        try {
          const resp = await axios.post(
            '/api/sundae/accounts/creators/creatorByHandle',
            { handle }
          );
          if (resp.status === 200) {
            doSetLandingData(resp?.data?.creator?.workshopLandingPageData);
            setCreator(resp?.data?.creator);
          }
        } catch (e) {
          console.log(e);
        }
      };
      const getCreatorWorkshop = async () => {
        try {
          setLoading(true);
          const resp = await axios.post('/api/sundae/workshop/workshopByHandle', {
            handle: workshopHandle,
          });
          console.log(resp.data, 'finally..................');
          if (resp.data.errorMessage) {
            setServerErr(resp.data.errorMessage);
          } else {
            setWorkshop(resp.data.workshop);
            if (resp?.data?.workshop?.webpageData) {
              console.log(JSON.parse(resp?.data?.workshop?.webpageData));
              setMidSection(JSON.parse(resp?.data?.workshop?.webpageData));
            }
          }
        } catch (e) {
          setServerErr(e.toString());
        } finally {
          setLoading(false);
        }
      };
      getCreatorWorkshop();
      getLandingByHandle();
    }
  }, [handle, workshopHandle, router.query.isPreview]);

  useEffect(() => {
    if (workshop) {
      setPageTitle(workshop.title);
    }
  }, [workshop]);

  return (
    <div className={styles.landing_container}>
      {router.query.isPreview === 'true' ? (
        <span className={styles.preview_container}>
          This is a preview
        </span>
      ) : ''}
      <Head>
        <title>
          Sundae -
          {pageTitle}
        </title>
      </Head>
      {isLoading ? (
        <SkeletonTheme color="#e3e7fe" highlightColor="#dee2e6">
          <p>
            <Skeleton count={3} height={100} />
          </p>
        </SkeletonTheme>
      ) : (
        <HeroHeader
          handle={handle}
          workshopHandle={workshopHandle}
          creator={creator}
          pageStyles={pageStyles}
          data={workshop}
        />
      )}
      {midSection ? (
        <WebPageDetail pageStyles={pageStyles} data={midSection} />
      ) : null}
      {!midSection && router.query.isPreview === 'true' ? (
        <WebPageDetail pageStyles={pageStyles} data={previewMidSection} />
      ) : null}
      <WorkshopSessions pageStyles={pageStyles} data={workshop} />
      <Modal centered isOpen={showModal}>
        <ModalBody>
          This workshop is not live yet and needs to be published first!
        </ModalBody>
      </Modal>
    </div>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: {
      ...params,
    },
  };
}

export default Workshop;

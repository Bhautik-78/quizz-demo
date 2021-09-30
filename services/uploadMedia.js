/* eslint-disable no-await-in-loop */
/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { Semaphore } from 'await-semaphore';
import axiosRetry from 'axios-retry';

const RETRYOPTIONS = {
  retries: 10000,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true
};
axiosRetry(axios, RETRYOPTIONS);

async function _startUpload(media, mediaType, progressCB, errorCB) {
  try {
    console.log(`${media.type} FileType`);
    progressCB('Init... 0');
    const startUploadResp = await fetch(
      '/api/sundae/multipartupload/startUpload',
      {
        body: JSON.stringify({
          mediaType,
          fileType: media.type.split('/')[1],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    const startUploadJson = await startUploadResp.json();
    if (startUploadJson.errors) {
      errorCB(startUploadJson.errors.toString());
      throw new Error(startUploadJson.errors);
    }
    const { uploadId, key } = startUploadJson;
    return _uploadMultipartFile({ media, uploadId, key }, progressCB, errorCB);
  } catch (err) {
    console.error(err);
    errorCB(err.toString());
    throw new Error(err);
  }
}

// ===============================================
// The uploadMultipartFile function splits the selectedFile into chunks
// of 10MB and does the following:
// (1) call the backend server for a presigned url for each part,
// (2) uploads them, and
// (3) upon completion of all responses, sends a completeMultipartUpload call to the backend server.
//
// Note: the AWS SDK can only split one file into 10,000 separate uploads.
// This means that, each uploaded part being 10MB, each file has a max size of
// 100GB.
// ===============================================

async function _uploadMultipartFile({ media, uploadId, key }, progressCB, errorCB) {
  try {
    console.log('Inside uploadMultipartFile');
    const semaphore = new Semaphore(5);
    const FILE_CHUNK_SIZE = 10000000; // 10MB
    const fileSize = media.size;
    const NUM_CHUNKS = Math.floor(fileSize / FILE_CHUNK_SIZE) + 1;
    let start; let end; let
      blob;
    const axiosUpload = axios.create();
    delete axiosUpload.defaults.headers.put['Content-Type'];
    axiosRetry(axiosUpload, RETRYOPTIONS);
    const allPercentsLoaded = Array(NUM_CHUNKS);
    allPercentsLoaded.fill(0);
    const promisesArray = await allPercentsLoaded.map(async (elem, i) => {
      const index = i + 1;
      const release = await semaphore.acquire();
      try {
        // (1) Generate presigned URL for each part
        const getPresignedUrlResp = await axios.put(
          '/api/sundae/multipartupload/getPresignedUrl',
          {
            key,
            partNumber: index,
            uploadId,
          },
        );

        console.log(getPresignedUrlResp);
        const { presignedUrl } = getPresignedUrlResp.data;
        console.log(
          `   Presigned URL ${
            i
          }: ${
            presignedUrl
          } filetype ${
            media.type}`
        );
        start = (index - 1) * FILE_CHUNK_SIZE;
        end = index * FILE_CHUNK_SIZE;
        blob = index < NUM_CHUNKS ? media.slice(start, end) : media.slice(start);
        // (2) Puts each file part into the storage server

        const uploadResp = await axiosUpload.put(
          presignedUrl,
          blob,
          {
            headers: {
              'Content-Type': media.type,
            },
            onUploadProgress: (pgEvent) => {
              console.log('uploading part', index);
              allPercentsLoaded[i] = pgEvent.loaded / pgEvent.total;
              const totalPercent = allPercentsLoaded.reduce((t, p) => t + p);
              progressCB(((totalPercent / NUM_CHUNKS) * 100).toFixed(2));
            },
          }
        );

        return uploadResp;
      } catch (err) {
        console.error(err);
        errorCB(err.toString());
      } finally {
        release();
      }
    });

    const resolvedArray = await Promise.all(promisesArray);
    console.log(resolvedArray, ' resolvedAr');

    const uploadPartsArray = [];
    resolvedArray.forEach((resolvedPromise, index) => {
      uploadPartsArray.push({
        ETag: resolvedPromise.headers.etag,
        PartNumber: index + 1,
      });
    });

    progressCB('Processing... 0');
    // (3) Calls the CompleteMultipartUpload endpoint in the backend server
    const completeUploadResp = await axios.put(
      '/api/sundae/multipartupload/completeUpload',
      {
        key,
        parts: uploadPartsArray,
        uploadId,
      }
    );

    const completeUploadJson = completeUploadResp.data;

    console.log(completeUploadJson.finalUrl, ' Stuff');
    return completeUploadJson.finalUrl;
  } catch (err) {
    errorCB(err.toString());
    console.error(err);
  }
}
export const uploadToS3 = async (media, progressCB, errorCB) => {
  console.log(media, '___1____');
  const assetType = media.type.split('/')[0];
  let mediaType = 'PDF';
  if (assetType === 'image') {
    mediaType = 'IMAGE';
  } else if (assetType === 'video') {
    mediaType = 'VIDEO';
  }
  // s3 doesn't accept multi-part for under 5mb files
  console.log(media.size);
  if (!progressCB) {
    progressCB = (i) => console.log(i);
  }

  if (!errorCB) {
    errorCB = (i) => console.error(i);
  }
  if (media.size < 1000000 * 5) {
    const presignedResp = await fetch('/api/sundae/presignedUrl', {
      body: JSON.stringify({
        mediaType,
        fileType: media.type.split('/')[1],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const presignedJson = await presignedResp.json();
    if (presignedJson.content) {
      const presignedData = JSON.parse(presignedJson.content);
      console.log(presignedData, '___2____');
      const axiosUpload = axios.create();
      delete axiosUpload.defaults.headers.put['Content-Type'];
      const uploadResp = await axiosUpload.put(
        presignedData.presignedUrl,
        media,
        {
          headers: {
            'Content-Type': media.type,
          },
          onUploadProgress: (progressEvent) => {
            progressCB(((progressEvent.loaded / media.size) * 100).toFixed(2));
          },
        }
      );
      console.log(uploadResp, 'media_upload_101');
      if (uploadResp.status !== 200) {
        // uploadResp failed;
        errorCB(`Upload failed due to ${uploadResp.status} error code`);
        throw new Error(uploadResp.status);
      }
      return presignedData.newUrl;
    }
    errorCB(presignedJson.errorMessage);
    console.error(presignedJson.errorMessage);
    throw new Error(presignedJson.errorMessage);
  } else {
    return _startUpload(media, mediaType, progressCB, errorCB);
  }
};

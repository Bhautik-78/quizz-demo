import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import styles from './pdfpage.module.scss';

const PdfPage = ({ pdfUrl, pageUpdateWithPdf, pageLoading }) => {
  const [pdfFile, setPdfFile] = useState('');
  const [pdfError, setPdfError] = useState(null);

  return (
    <div className="container-fluid p-0">
      <main className={styles.main}>
        <div className="container-fluid p-0">
          <div className="row">
            <div className="col-md-8">
              <Dropzone
                accept="application/pdf"
                style={{ width: '100%' }}
                onDrop={(acceptedFiles) => {
                  setPdfError(null);
                  setPdfFile(acceptedFiles[0]);
                  console.log(acceptedFiles);
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <section className="upload-file-container">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <img src="/Assets/image.png" />
                      <p>Upload PDF</p>
                    </div>
                  </section>
                )}
              </Dropzone>
              <small className="text-danger pl-2">
                {pdfError || ''}
              </small>
              <small className="text-success font-weight-bold pl-2 mt-1">
                {pdfFile ? pdfFile.name : ''}
              </small>
              <br />
              {pdfFile ? (
                <button
                  disabled={pageLoading ? 'disabled' : ''}
                  onClick={() => {
                    pageUpdateWithPdf(pdfFile);
                    setPdfFile('');
                  }}
                  className="btn btn-primary ml-3 mt-2"
                >
                  Save
                </button>
              ) : (
                pageLoading ? (
                  <button
                    disabled="disabled"
                    className="btn btn-primary ml-3 mt-2"
                  >
                    Loading...
                  </button>
                ) : null
              )}
            </div>
            <div className="col-md-4">
              <div className={styles.mobile_side_container}>
                <div className={styles.gridmobile}>
                  <iframe
                    src={`https://docs.google.com/viewerng/viewer?url=${pdfUrl}&embedded=true`}
                    frameBorder="0"
                    height="500px"
                    width="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PdfPage;

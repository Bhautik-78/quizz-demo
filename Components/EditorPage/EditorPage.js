import React, { Component } from 'react';
import {
  Modal, ModalBody, Row, Col
} from 'reactstrap';
import Dropzone from 'react-dropzone';
import dynamic from 'next/dynamic';
import { EditorState, AtomicBlockUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { uploadToS3 } from '../../services/uploadMedia';
import { getIndex, setIndex } from './editor.service';
import styles from './e-page.module.scss';

let Editor;
if (process.browser) {
  Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor));
}

const CustomButton = (props) => (
  <div className={styles.video_upload_btn}>
    <button type="button" onClick={() => props.setUpdateModal()} className="btn">
      <img
        src="https://millieapp.s3.amazonaws.com/assets/multimedia.png"
        alt="videoicon"
      />
    </button>
  </div>
);

// const blockDndPlugin = createBlockDndPlugin();
// const plugins = [blockDndPlugin];
class EditorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      loading: true,
      assetObj: '',
      urlValue: '',
      urlType: '',
      uploadModal: false,
      isDisabled: true,
      uploadErr: '',
      uploadAssetLoading: false,
      uploadAssetProgress: 0,
      assetsArray: [],
      currentUploadIndex: null,
    };
  }

  componentDidMount() {
    this.setState({ loading: false });
  }

  onEditorStateChange = (editorState) => {
    const { setEditorState } = this.props;
    setEditorState(editorState);
    this.setState({
      isDisabled: false,
    });
  };

  doUploadMedia = async () => {
    this.setState({
      uploadErr: ''
    });
    const { assetsArray } = this.state;
    console.log(assetsArray, assetsArray.length);
    if (assetsArray.length < 1) {
      this.setState({ uploadErr: 'Please upload a valid media file' });
    } else {
      const assetsArrayCopy = [...assetsArray];
      const loopLength = assetsArray.length;
      try {
        this.setState({ uploadAssetLoading: true });
        for (let i = 0; i < loopLength; i += 1) {
          setIndex(i);
          // eslint-disable-next-line no-await-in-loop
          const uploadAsset = await uploadToS3(
            assetsArrayCopy[i].file,
            this.setAssetProgress,
            this.setAssetError
          );
          const urlType = assetsArrayCopy[i].file.type.split('/')[0];
          const { editorState } = this.props;
          const contentState = editorState.getCurrentContent();
          const contentStateWithEntity = contentState.createEntity(
            urlType,
            'IMMUTABLE',
            { src: uploadAsset }
          );
          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
          const newEditorState = EditorState.set(editorState, {
            currentContent: contentStateWithEntity,
          });
          // this.deleteAsset(i)
          this.props.setEditorState(
            AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
          );
        }

        this.setState(
          {
            uploadModal: false,
            isDisabled: false,
            uploadAssetLoading: false,
            uploadAssetProgress: 0,
            assetsArray: [],
          },
          () => {
            console.log('hs');
          }
        );
      } catch (e) {
        console.log(e);
        this.setState({
          uploadErr: 'Incompatible Media',
          uploadAssetLoading: false,
          uploadAssetProgress: 0,
        });
      }
    }
  };

  mediaBlockRenderer = (block) => {
    if (block.getType() === 'atomic') {
      return {
        component: this.Media,
        editable: false,
      };
    }
    return null;
  };

  Media = (props) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    // console.log(entity, 'entity');
    const { src } = entity.getData();
    // console.log(src, 'src');
    const type = entity.getType();
    // console.log('inside', type);
    let media;
    if (type === 'audio') {
      media = (
        <audio
          style={{
            maxWidth: '50%',
            height: '300px',
            padding: '10px',
            objectFit: 'scale-down',
          }}
          controls
        >
          <source src={src} type="audio/mpeg" />
        </audio>
      );
    } else if (type === 'image') {
      media = (
        <img
          style={{
            maxWidth: '50%',
            height: '300px',
            padding: '10px',
            objectFit: 'scale-down',
          }}
          src={src}
        />
      );
    } else if (type === 'video') {
      media = (
        <video
          style={{
            maxWidth: '50%',
            height: 'auto',
            padding: '10px',
            objectFit: 'scale-down',
          }}
          controls
          src={src}
        />
      );
    }
    return media;
  };

  setHtml = () => {
    const options = {
      entityStyleFn: (entity) => {
        const entityType = entity.get('type').toLowerCase();
        // console.log(entity, 'yoimage');
        // console.log(entityType, 'yoimagetype');
        if (entityType === 'image') {
          const data = entity.getData();
          return {
            element: 'img',
            attributes: {
              src: data.src,
            },
            style: {
              // Put styles here...
            },
          };
        }
        if (entityType === 'video') {
          const data = entity.getData();
          return {
            element: 'video',
            attributes: {
              src: data.src,
            },
            style: {},
          };
        }
      },
    };
    const html = stateToHTML(this.props.editorState.getCurrentContent(), options);
    this.props.setHtmlContent(html);
    this.setState({ isDisabled: true });
  };

  setAssetProgress = (percent) => {
    const assetsCopy = [...this.state.assetsArray];
    assetsCopy[getIndex()].percent = percent;
    this.setState({
      assetsArray: assetsCopy,
    });
  };

  setAssetError = (err) => {
    this.setState({
      uploadErr: err
    });
  }

  setUpdateModal = () => {
    this.setState({ uploadModal: true });
  };

  deleteAsset = (i) => {
    const assetsCopy = [...this.state.assetsArray];
    assetsCopy.splice(i, 1);
    this.setState({
      assetsArray: assetsCopy,
    });
  };

  render() {
    const {
      isDisabled,
      uploadAssetLoading,
      uploadAssetProgress,
      urlType,
      urlValue,
    } = this.state;
    const { editorState, htmlContent } = this.props;
    return (
      <div className="container-fluid p-0">
        <main className={styles.main}>
          <div className="container-fluid p-0">
            <div className="row">
              <div className="col-md-8">
                <div className={styles.grid}>
                  {this.state.loading ? (
                    <div>Loading...</div>
                  ) : (
                    <Editor
                      wrapperClassName="custom-editor-container"
                      toolbarClassName="custom-toolbar"
                      editorClassName="custom-editor"
                      editorState={editorState}
                      onEditorStateChange={this.onEditorStateChange}
                      blockRendererFn={this.mediaBlockRenderer}
                      // plugins={plugins}
                      // stripPastedStyles={true}
                      handlePastedFiles={(e) => {
                        console.log(e);
                        this.setState(
                          {
                            assetObj: e[0],
                            urlType: e[0].type.split('/')[0],
                            uploadErr: '',
                          },
                          () => {
                            this.doUploadMedia();
                          }
                        );
                      }}
                      handlePastedText={(e, html) => console.log(html, 'ypuo')}
                      toolbarCustomButtons={[
                        <CustomButton setUpdateModal={this.setUpdateModal} />,
                      ]}
                      ref={(element) => {
                        this.editor = element;
                      }}
                      toolbar={{
                        options: [
                          'inline',
                          'blockType',
                          'list',
                          'link',
                          'history',
                        ],
                        blockType: {
                          inDropdown: false,
                          options: ['H1', 'H2'],
                        },
                        inline: {
                          options: ['bold', 'italic'],
                        },
                        link: {
                          options: ['link'],
                          defaultTargetOption: '_blank',
                        },
                        list: {
                          options: ['unordered', 'ordered'],
                        },
                        history: {
                          inDropdown: false,
                          options: ['undo', 'redo'],
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <div className={styles.mobile_side_container}>
                  <button
                    type="button"
                    disabled={isDisabled ? 'disabled' : ''}
                    className="btn btn-primary btn-sm"
                    onClick={this.setHtml}
                  >
                    Preview for mobile view
                  </button>
                  <small>{!isDisabled ? 'There are new changes' : ''}</small>
                  <div className={styles.gridmobile}>
                    <div
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{
                        __html: htmlContent,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Modal
            centered
            isOpen={this.state.uploadModal}
            toggle={() => (uploadAssetLoading
              ? this.setState({ uploadModal: true })
              : this.setState({ uploadModal: false }))}
          >
            <ModalBody>
              <div className={styles.modal_form_container}>
                <Row>
                  <Col sm={12} md={12}>
                    {this.state.assetsArray.length
                      ? this.state.assetsArray.map((item, i) => (
                        <div
                          className={styles.asset_title}
                          key={item.file.name}
                        >
                          <p>{item.file.name}</p>
                          {item.percent !== null ? (
                            <p className={styles.percent}>
                              {item.percent}
                              {' '}
                              %
                            </p>
                          ) : (
                            <p
                              onClick={() => (uploadAssetLoading
                                ? null
                                : this.deleteAsset(i))}
                            >
                              <img src="/Assets/trash.svg" />
                            </p>
                          )}
                        </div>
                      ))
                      : ''}
                    <Dropzone
                      disabled={!!uploadAssetLoading}
                      accept="image/*, video/mp4"
                      style={{ width: '100%' }}
                      onDrop={(acceptedFiles) => {
                        const files = acceptedFiles.map((file) => ({ file, percent: null }));
                        console.log(files);
                        this.setState({
                          assetsArray: [...this.state.assetsArray, ...files],
                        });
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section className={styles.upload_file_container}>
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <img src="/Assets/image.png" />
                            <p>Upload File JPG/JPEG/PNG/GIF/MP4</p>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </Col>
                </Row>
                <div className={styles.btn_container}>
                  <button
                    disabled={uploadAssetLoading ? 'disabled' : ''}
                    onClick={this.doUploadMedia}
                    className="btn btn-primary"
                  >
                    {uploadAssetLoading ? 'Loading...' : 'Upload'}
                  </button>
                </div>
                <div className={styles.err_container}>
                  <small style={{ color: 'red', textAlign: 'center' }}>
                    {this.state.uploadErr}
                  </small>
                </div>
              </div>
            </ModalBody>
          </Modal>
        </main>
      </div>
    );
  }
}

export default EditorPage;
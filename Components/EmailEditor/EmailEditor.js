import React, { Component } from 'react';
import {
  Modal, ModalBody, Row, Col
} from 'reactstrap';
import Dropzone from 'react-dropzone';
import dynamic from 'next/dynamic';
import { EditorState, AtomicBlockUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { uploadToS3 } from '../../services/uploadMedia';
import styles from './e-editor.module.scss';

let Editor;
if (process.browser) {
  Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor));
}
class EmailEditor extends Component {
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
                <div className="col-md-12">
                  <div className={styles.grid}>
                    {this.state.loading ? (
                      <div>Loading...</div>
                    ) : (
                      <Editor
                        wrapperClassName="custom-editor-container"
                        toolbarClassName="custom-toolbar"
                        editorClassName="session-custom-editor"
                        placeholder={this.props.placeholder || null}
                        editorState={editorState}
                        onEditorStateChange={this.onEditorStateChange}
                        blockRendererFn={this.mediaBlockRenderer}
                        handlePastedText={(e, html) => console.log(html, 'ypuo')}
                        ref={(element) => {
                          this.editor = element;
                        }}
                        toolbar={{
                          options: [
                            'inline',
                            'blockType',
                            'list',
                            'link',
                            // 'history',
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
              </div>
            </div>
          </main>
        </div>
      );
    }
}

export default EmailEditor;

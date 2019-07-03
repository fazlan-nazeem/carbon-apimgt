/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useRef } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import Icon from '@material-ui/core/Icon';
import Paper from '@material-ui/core/Paper';
import Alert from 'AppComponents/Shared/Alert';
import CreateEditForm from './CreateEditForm';
import Api from 'AppData/api';

const styles = {
    appBar: {
        position: 'relative',
    },
    flex: {
        flex: 1,
    },
    popupHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    splitWrapper: {
        padding: 0,
    },
    docName: {
        alignItems: 'center',
        display: 'flex',
    },
    button: {
        height: 30,
        marginLeft: 30,
    },
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

function Edit(props) {
    const restAPI = new Api();

    const { intl } = props;
    const [open, setOpen] = useState(false);
    let createEditForm = useRef(null);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const updateDoc = () => {
        const { apiId } = props;
        const promiseWrapper = createEditForm.updateDocument(apiId);
        promiseWrapper.docPromise
            .then(doc => {
                const { documentId, name } = doc.body;
                if (promiseWrapper.file && documentId) {
                    const filePromise = restAPI.addFileToDocument(apiId, documentId, promiseWrapper.file[0]);
                    filePromise
                        .then(doc => {
                            Alert.info(
                                `${name} ${intl.formatMessage({
                                    id: 'documents.markdown.editor.updated.file.successfully',
                                    defaultMessage: 'File uploaded successfully.',
                                })}`,
                            );
                            props.getDocumentsList();
                            toggleAddDocs();
                        })
                        .catch(error => {
                            if (process.env.NODE_ENV !== 'production') {
                                console.log(error);
                                Alert.error(intl.formatMessage({
                                    id: 'documents.markdown.editor.updated.file.error',
                                    defaultMessage: 'Error uploading the file.',
                                }));
                            }
                        });
                } else {
                    Alert.info(
                        `${doc.name} ${intl.formatMessage({
                            id: 'documents.markdown.editor.updated.successfully',
                            defaultMessage: 'Updated successfully.',
                        })}`,
                    );
                    props.getDocumentsList();
                    toggleAddDocs();
                }
            })
            .catch(error => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                    Alert.error(intl.formatMessage({
                        id: 'documents.markdown.editor.updated.error',
                        defaultMessage: 'Error adding the document',
                    }));
                }
            });
    };

    
    const { classes, docId, apiId } = props;
    return (
        <div>
            <Button onClick={toggleOpen}>
                <Icon>edit</Icon> <FormattedMessage id="documents.text.editor.editor" defaultMessage="Edit" />
            </Button>
            <Dialog open={open} onClose={toggleOpen} TransitionComponent={Transition} fullScreen>
                <Paper square className={classes.popupHeader}>
                    <IconButton color="inherit" onClick={toggleOpen} aria-label="Close">
                        <Icon>close</Icon>
                    </IconButton>
                    <Typography variant="h4" className={classes.docName}>
                        <FormattedMessage id="documents.text.editor.edit.content" defaultMessage="Edit " />"
                        {props.docName}"
                    </Typography>
                    <Button className={classes.button} variant="contained" color="primary" onClick={updateDoc}>
                        <FormattedMessage id="documents.text.editor.update.content" defaultMessage="Save" />
                    </Button>
                    <Button className={classes.button} onClick={toggleOpen}>
                        <FormattedMessage id="documents.text.editor.cancel" defaultMessage="Cancel" />
                    </Button>
                </Paper>
                <div className={classes.splitWrapper}>
                    <CreateEditForm
                        innerRef={node => {
                            createEditForm = node;
                        }}
                        docId={docId}
                        apiId={apiId}
                    />
                </div>
            </Dialog>
        </div>
    );
}
Edit.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    apiId: PropTypes.shape({}).isRequired,
    docId: PropTypes.shape({}).isRequired,
    getDocumentsList: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(withStyles(styles)(Edit));
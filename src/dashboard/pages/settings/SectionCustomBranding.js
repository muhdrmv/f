import React, {useState} from 'react'
import PublishIcon from '@material-ui/icons/Publish';
import {Button, Grid, Paper, Snackbar} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation} from '@apollo/client';
import BusinessIcon from '@material-ui/icons/Business';
import {Cancel} from "@material-ui/icons";

const SET_SYSTEM_SETTINGS = gql`
mutation ($name: String!, $value: String!) {

  delete_settings (where: {_and: [
    {type: {_eq: "system"}},
    {name: {_eq: $name}}
  ]}) {
    affected_rows
  }  
  
  insert_settings_one(object: {
      type: "system", 
      name: $name, 
      value: $value, 
  }) {
    id
  }
}
`;

const DELETE_SYSTEM_SETTINGS = gql`
mutation ($name: String!) {

  delete_settings (where: {_and: [
    {type: {_eq: "system"}},
    {name: {_eq: $name}}
  ]}) {
    affected_rows
  }  
  
}
`;

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
    },
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    },
}));

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const SectionCustomBranding = () => {

    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false, message: ''});
    const [inProgress, setInProgress] = React.useState(false);
    const inputFileEl = React.useRef();
    const inputFileElBackground = React.useRef();
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
    const [deleteSystemSetting,] = useMutation(DELETE_SYSTEM_SETTINGS);

    const handleUpload = async (settingName, file) => {
        try {
            const b64 = await toBase64(file);
            try {
                await setSystemSetting({
                    variables: {
                        name: settingName,
                        value: b64,
                    }
                });
                setSnackbarState({message: 'Successful', isOpen: true})
                setTimeout(() => {
                    setSnackbarState(s => ({...s, isOpen: false}));
                }, 1000);
            } catch (e) {
                alert(e.message);
            }
        } catch (e) {
            // alert('Select valid file');
        }
    };

    const handleFormSubmit = async e => {
        setInProgress(true);
        const file = inputFileEl.current.files[0];
        const fileBackground = inputFileElBackground.current.files[0];
        await handleUpload('brandingLogo', file);
        await handleUpload('brandingBackground', fileBackground);
        setInProgress(false);
    };

    const handleDeleteIcon = async () => {
        if (window.confirm('Are you sure you want to delete logo?')) {
            await deleteSystemSetting({
                variables: {
                    name: 'brandingLogo'
                }
            })
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
        }
    }

    const handleDeleteBackground = async () => {
        if (window.confirm('Are you sure you want to delete background?')) {
            await deleteSystemSetting({
                variables: {
                    name: 'brandingBackground'
                }
            })
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
        }
    }

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="Custom Branding"
                        toolbarIcon={<BusinessIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'}/>
            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off"
                      onSubmit={handleFormSubmit}>

                    <Grid container spacing={3}>

                        <Grid item xs={6} style={{textAlign: 'center'}}>
                            <Button
                                variant="outlined"
                                color="primary"
                                component="label"
                                startIcon={<PublishIcon/>}
                            >
                                Select Logo
                                <input
                                    ref={inputFileEl}
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    hidden
                                />
                            </Button>
                        </Grid>

                        <Grid item xs={6} style={{textAlign: 'center'}}>
                            <Button
                                variant="outlined"
                                color="primary"
                                component="label"
                                startIcon={<Cancel/>}
                                onClick={handleDeleteIcon}
                            >
                                Delete Logo
                            </Button>
                        </Grid>

                        <Grid item xs={6} style={{textAlign: 'center'}}>
                            <Button
                                variant="outlined"
                                color="primary"
                                component="label"
                                startIcon={<PublishIcon/>}
                            >
                                Select Background
                                <input
                                    ref={inputFileElBackground}
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    hidden
                                />
                            </Button>
                        </Grid>

                        <Grid item xs={6} style={{textAlign: 'center'}}>
                            <Button
                                variant="outlined"
                                color="primary"
                                component="label"
                                startIcon={<Cancel/>}
                                onClick={handleDeleteBackground}
                            >
                                Delete Background
                            </Button>
                        </Grid>

                    </Grid>

                    <BottomToolbar onClickDone={handleFormSubmit}
                                   inProgress={inProgress}/>

                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message}/>
        </Paper>

    )
}

export default SectionCustomBranding

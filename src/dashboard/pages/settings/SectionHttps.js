import React, {useState} from 'react'
import PublishIcon from '@material-ui/icons/Publish';
import {
    Button,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    Paper,
    Snackbar,
    Switch
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import LockIcon from '@material-ui/icons/Lock';

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

const QUERY_SYSTEM_SETTINGS = gql`
query {
  settings (where: {_and: [
    {type: {_eq: "system"}},
  ]}) {
    name
    value
  }
}
`;

const ACTION_MGMT_SSL = gql`
mutation ($redirect: Boolean!, $key: String!, $certification: String!) {
  action_mgmt_ssl(redirect: $redirect, key: $key, certification: $certification) {
    success
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

const toText = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const SectionHttps = () => {
    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
    const [inProgress, setInProgress] = React.useState(false);
    const [formState, setFormState] = React.useState({
        redirectToHttps: false,
    });

    const inputFileEl = React.useRef();
    const inputFileEl2 = React.useRef();

    const {loading, error, data, refetch} = useQuery(QUERY_SYSTEM_SETTINGS);
    const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
    const [actionMgmtSsl,] = useMutation(ACTION_MGMT_SSL);

    React.useEffect(() => {
        if (loading || error) return;
        let settings = {};
        data.settings.forEach(i => settings[i.name] = i.value);
        const redirectToHttps = (settings?.redirectToHttps === 'true');
        setFormState(s => ({...s, redirectToHttps}))
    }, [data]);

    const handleChange = (e) => {
        const name = e.target.name;
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        setFormState(s => ({
            ...s, [name]: value
        }));
    };

    const handleFormSubmit = async e => {
        setInProgress(true);
        const {
            redirectToHttps,
        } = formState;
        try {
            await setSystemSetting({
                variables: {
                    name: 'redirectToHttps',
                    value: redirectToHttps.toString(),
                }
            });

            const redirect =  formState.redirectToHttps;
            let certification = '';
            let key = '';
            if (inputFileEl.current.files[0] && inputFileEl2.current.files[0]) {
                certification =  await toText(inputFileEl.current.files[0]);
                key =   await toText(inputFileEl2.current.files[0]);
            }
            await actionMgmtSsl({
                variables: {
                    redirect, certification, key
                }
            });
            setSnackbarState({message: 'Successful. Server reboot is required.', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
        } catch (e) {
            console.log(e);
            alert('Data access error');
        }
        setInProgress(false);
    };

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="HTTPS Configuration"
                        toolbarIcon={<LockIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'} />

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off"
                      onSubmit={handleFormSubmit}>

                    <Grid container spacing={3}>

                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Enable secure HTTP</FormLabel>
                                <FormGroup style={{padding: "1em 2em"}}>
                                    <FormControlLabel
                                        control={<Switch checked={formState.redirectToHttps} onChange={handleChange} name="redirectToHttps"/>}
                                        label="Redirect HTTP requests to HTTPS"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} style={{textAlign: 'center'}}>

                            <Button
                                variant="outlined"
                                color="primary"
                                component="label"
                                style={{margin: 12}}
                                startIcon={<PublishIcon/>}
                            >
                                Select SSL certificate
                                <input
                                    ref={inputFileEl}
                                    type="file"
                                    hidden
                                    accept=".crt, .cert, .pem"
                                />
                            </Button>

                            <Button
                                variant="outlined"
                                color="primary"
                                component="label"
                                style={{margin: 12}}
                                startIcon={<PublishIcon/>}
                            >
                                Select SSL key
                                <input
                                    ref={inputFileEl2}
                                    type="file"
                                    accept=".key, .cert, .pem"
                                    hidden
                                />
                            </Button>
                        </Grid>
                    </Grid>
                    <BottomToolbar onClickDone={handleFormSubmit}
                                   inProgress={inProgress}/>

                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
        </Paper>
    )
}

export default SectionHttps

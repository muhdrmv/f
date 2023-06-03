import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Grid, Paper, Snackbar, TextField} from '@material-ui/core';
import {useHistory} from "react-router-dom";
import {gql, useMutation, useQuery} from '@apollo/client';
import TopToolbar from './TopToolbar';
import BottomToolbar from './BottomToolbar';
import AlertDialog from "../../../pages/AlertDialog";
import PasswordTextField from "../../shared-components/PasswordTextField";

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

const GET_2FA_SECRET = gql`
  query {
    action_auth_get_2fa_secret {
      qrImage
      secret
    }
  }
`;

const SET_2FA = gql`
  mutation ($accountPassword: String!, $oneTimePassword: String!, $secret: String!) {
    action_auth_set_2fa(accountPassword: $accountPassword, oneTimePassword: $oneTimePassword, secret: $secret) {
      success
    }
  }
`;

const Enable2FA = () => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);
    const [formState, setFormState] = useState({
        currentPassword: '',
        currentToken: '',
        secret: '',
    });
    const [validationErrorState, setValidationErrorState] = useState({
        currentPassword: false,
        currentToken: false,
    });
    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });

    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const handleDialogClose = () => {
        setAlertDialogOpen(false);
    }

    const {data, loading, error} = useQuery(GET_2FA_SECRET);
    const [setup2FA,] = useMutation(SET_2FA);

    useEffect(() => {
        if (data?.action_auth_get_2fa_secret?.secret) {
            setFormState(s => ({...s, secret: data.action_auth_get_2fa_secret.secret}))
        }
        if (data?.action_auth_get_2fa_secret?.qrImage)
            setFormState(s => ({...s, qrImage: data.action_auth_get_2fa_secret.qrImage}))
    }, [data, loading, error])

    const handleChangeTextField = e => {
        setFormState(s => ({...s, [e.target.name]: e.target.value}));
        const setAll = (obj, val) => Object.keys(obj).forEach(k => obj[k] = val);
        setValidationErrorState(s => {setAll(s, false); return s;});
    }

    const history = useHistory();

    const handleSubmitSetup2FA = async e => {

        if (!formState.currentPassword) {
            setValidationErrorState(s => ({...s, currentPassword: true}));
            return;
        }

        if (!formState.currentToken) {
            setValidationErrorState(s => ({...s, currentToken: true}));
            return;
        }

        setInProgress(true);
        const {
            currentPassword,
            currentToken,
            secret,
        } = formState;
        try {
            const mutationResult = await setup2FA({
                variables: {
                    accountPassword: currentPassword,
                    oneTimePassword: currentToken,
                    secret,
                }
            });
            console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
                window.location.reload();
            }, 1000);
        } catch (e) {
            setAlertDialogOpen(true);
            setAlertMessage(e.message);
        }
        setInProgress(false);
    };

    return (
            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle="Enable Two Factor Authentication" backLinkUrl="/dashboard"
                            onClickDone={handleSubmitSetup2FA} inProgress={inProgress}/>
                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleSubmitSetup2FA}>

                        <Grid container spacing={3}>

                            <Grid item xs={6}>

                                <div style={{display:'block'}} >
                                    Scan QR code via authenticator app
                                    <p>{formState.secret}</p>
                                </div>
                                <br  style={{display:'block'}} />
                                { data && data.action_auth_get_2fa_secret && data.action_auth_get_2fa_secret.qrImage &&
                                    <img style={{display:'block'}} src={data.action_auth_get_2fa_secret.qrImage} />
                                }
                            </Grid>

                            <Grid item xs={6}>
                                <PasswordTextField id="current-password" label="Account password"
                                                   variant="outlined" fullWidth
                                                   onChange={handleChangeTextField} name="currentPassword"
                                                   value={formState.currentPassword}
                                                   error={validationErrorState.currentPassword}/>
                                <TextField id="token" label="One time password"
                                           variant="outlined" fullWidth
                                           onChange={handleChangeTextField} name="currentToken"
                                           value={formState.currentToken}
                                           error={validationErrorState.currentToken}/>
                            </Grid>

                        </Grid>

                        <BottomToolbar backLinkUrl="/dashboard" onClickDone={handleSubmitSetup2FA}
                                       inProgress={inProgress}/>

                    </form>
                </div>
                <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} message={alertMessage} />
                <Snackbar
                    open={snackbarState.isOpen}
                    // onClose={handleSnackbarClose}
                    // TransitionComponent={(<Slide direction="up" />)}
                    message={snackbarState.message}
                    // key={SlideTransition.name}
                />

            </Paper>

    )
}

export default Enable2FA;

import React, {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Grid, Paper, TextField} from '@material-ui/core';
import {useHistory} from "react-router-dom";
import {gql, useMutation} from '@apollo/client';
import TopToolbar from './TopToolbar';
import BottomToolbar from './BottomToolbar';
import AlertDialog from "../../../pages/AlertDialog";

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

const Disable2FA = () => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);
    const [formState, setFormState] = useState({
        currentPassword: '',
        oneTimePassword: '',
    });
    const [validationErrorState, setValidationErrorState] = useState({
        currentPassword: false,
        oneTimePassword: false,
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

    const [setup2FA,] = useMutation(SET_2FA);

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

        setInProgress(true);
        const {
            currentPassword,
        } = formState;
        try {
            const mutationResult = await setup2FA({
                variables: {
                    accountPassword: currentPassword,
                    oneTimePassword: '',
                    secret: '',
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

                <TopToolbar toolbarTitle="Disable Two Factor Authentication" backLinkUrl="/dashboard"
                            onClickDone={handleSubmitSetup2FA} inProgress={inProgress}/>
                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleSubmitSetup2FA}>

                        <Grid container spacing={3}>

                            <Grid item xs={12}>
                                <div>
                                    Enter your account password and click done to disable second factor in sign in
                                </div>
                                <TextField id="current-password" label="Account password" type="password"
                                           variant="outlined" fullWidth
                                           onChange={handleChangeTextField} name="currentPassword"
                                           value={formState.currentPassword}
                                           error={validationErrorState.currentPassword}/>
                            </Grid>

                            <Grid item xs={12} style={{display: 'none'}}>
                                <TextField id="token" label="One time token"
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
            </Paper>

    )
}

export default Disable2FA;

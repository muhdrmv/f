import React, {useEffect, useState} from 'react'
import {Paper, Snackbar, TextField} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useMutation} from '@apollo/client';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import {useHistory} from "react-router-dom";

const ACTION_LICENSE_CHALLENGE = gql`
mutation ($answer: String) {
  action_mgmt_license_challenge(answer: $answer) {
    success
    challengeCode
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
    challenge: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '20px',
    }
}));

const SectionSystemLicenseChallenge = () => {
    const classes = useStyles();
    const [snackbarState, setSnackbarState] = useState({isOpen: false, message: ''});
    const [inProgress, setInProgress] = React.useState(false);
    const [licenseKey, setLicenseKey] = React.useState('');
    const [challengeCode, setChallengeCode] = React.useState('');
    const handleChangeLicenseKey = e => {
        setLicenseKey(e.target.value);
    }

    const [licenseChallenge,] = useMutation(ACTION_LICENSE_CHALLENGE);
    const history = useHistory();

    const init = async () => {
        const {data} = await licenseChallenge({variables: {answer: null}});
        setChallengeCode(data?.action_mgmt_license_challenge?.challengeCode);
    }
    useEffect(init, []);

    const handleFormSubmitLicenseKey = async licenseKey => {
        if (!licenseKey) {
            return;
        }
        setInProgress(true);
        try {
            const mutationResult = await licenseChallenge({
                variables: {answer: licenseKey}
            });
            console.log(mutationResult);
            if (mutationResult?.data?.action_mgmt_license_challenge?.success) {
                setSnackbarState({message: 'Successful', isOpen: true})
                setTimeout(() => {
                    setSnackbarState(s => ({...s, isOpen: false}));
                    history.goBack();
                }, 1000);
            } else {
                alert("Answer code not valid")
            }

        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="System License Challenge"
                        toolbarIcon={<AssignmentTurnedInIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'}/>

            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off">
                    <TextField label="Challenge Code" type="text" variant="outlined" fullWidth className={classes.challenge}
                               value={challengeCode} InputProps={{readOnly: true}}/>
                    <TextField id="Answer-Code" label="Answer Code" type="text" variant="outlined" fullWidth
                               onChange={handleChangeLicenseKey} name="licenseKey"
                               value={licenseKey} autoFocus={true} />
                    <BottomToolbar onClickDone={() => handleFormSubmitLicenseKey(licenseKey)}
                                   inProgress={inProgress}
                                   backLinkUrl={'/dashboard/settings'}/>
                </form>
            </div>
            <Snackbar open={snackbarState.isOpen} message={snackbarState.message}/>
        </Paper>
    )
}

export default SectionSystemLicenseChallenge

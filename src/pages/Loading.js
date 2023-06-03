import React, {useEffect, useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {Redirect} from "react-router-dom";


const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    cont: {
        backgroundColor: '#fafafa;',
    }
}));

export default function Loading({authError, loggedInUser, intendedUrl}) {
    const classes = useStyles();

    const [error, setError] = useState('');
    useEffect( () => {
        setError(authError ? 'Error accessing authentication service' : null);
    }, [authError]);

    return (
        <Container component="main" maxWidth={false} className={classes.cont}>
            {loggedInUser?.id === '' && <Redirect to={'/sign-in'}/>}
            {loggedInUser?.id && <Redirect to={intendedUrl}/>}
            <CssBaseline/>
            <div className={classes.root}>
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5" style={{marginTop: '30px'}}>
                        {error ? error : 'Loading...'}
                    </Typography>
                </div>
                <div style={{maxWidth: '400px', margin: '2em auto'}}>
                    {!error ?
                        <LinearProgress/>
                        :
                        <LinearProgress variant="determinate" value={100}/>
                    }
                </div>
            </div>
        </Container>
    );
}
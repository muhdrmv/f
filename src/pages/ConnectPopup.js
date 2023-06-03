import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import LinearProgress from "@material-ui/core/LinearProgress";
import {gql, useMutation} from '@apollo/client';
import ConnectPopupCredentialsPrompt from './ConnectPopupCredentialsPrompt';

const ACTION_SESS_CONNECT = gql`
mutation ($accessRuleId: String!, $connectionId: String!, $extra: json) {
  action_sess_connect(accessRuleId: $accessRuleId, connectionId: $connectionId, extra: $extra) {
    tokenPayload
    meta
  }
}
`;

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

export default function ConnectPopup({error}) {
  const [doSessionConnect,] = useMutation(ACTION_SESS_CONNECT);
  const classes = useStyles();
  const [credentialsPrompt, setCredentialsPrompt] = React.useState({
    shown: false,
    loading: false,
    username: '',
    domain: '',
    password: '',
  });
  const urlParams = new URLSearchParams(window.location.search);
  const connectionId = urlParams.get('c');
  const accessRuleId = urlParams.get('a');

  const init = async (extra) => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000);
    try {
      const connectResult = await doSessionConnect({variables: {connectionId, accessRuleId, extra}});
      if (connectResult?.data?.action_sess_connect.tokenPayload) {
        const localStorageTokenValue = connectResult.data.action_sess_connect.tokenPayload;
        window.localStorage.setItem(process.env.REACT_APP_LOCAL_STORAGE_KEY, localStorageTokenValue);
        window.location = process.env.REACT_APP_TUNNEL_URL;
      }
    } catch (e) {
      if (e.message === 'credentials_required') {
        setCredentialsPrompt(s => ({...s, shown: true}) );
      } else {
        alert(e.message);
        window.close();
      }
    }
  }

  React.useEffect(() => {
    init();
  }, []);

  const handleConnectWithCredentials = async (username, password) => {
    setCredentialsPrompt(s => ({...s, loading: true}));
    await init({credentials: {username, password}});
    setCredentialsPrompt(s => ({...s, loading: false}));
  }

  return (
      <Container component="main" maxWidth="s" className={classes.cont}>
        <CssBaseline/>
        { !credentialsPrompt.shown ?
          <div className={classes.root}>
            <div className={classes.paper}>
              <Typography component="h1" variant="h5" style={{marginTop: '30px'}}>
                {error ? error : 'Connecting...'}
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
          :
          <Grid item xs={12} md={4} lg={3} style={{textAlign: 'center', margin: '20px auto '}} >
            <Paper style={{padding: '15px'}}>
              <ConnectPopupCredentialsPrompt onSubmit={handleConnectWithCredentials} loading={credentialsPrompt.loading}/>
            </Paper>
          </Grid>
        }
      </Container>
  );
}
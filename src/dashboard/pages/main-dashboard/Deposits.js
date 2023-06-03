import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './Title';
import Button from '@material-ui/core/Button';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});

export default function Deposits() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Winodws 10</Title>
      <Typography component="p" variant="h6" gutterBottom>
        <SettingsEthernetIcon style={{position: 'relative', top: '5px'}} /> RDP
      </Typography>
      {/* <Typography color="textSecondary" className={classes.depositContext}>
        Last connected on 15 March, 2019
      </Typography> */}
      <div>
      <Button
        variant="outlined"
        color="primary"
        className={classes.button}
        startIcon={<OpenInNewIcon />}
        style={{width: '100%'}}
        size="large"
        disabled={true}
      >
        Connect
      </Button>
      </div>
    </React.Fragment>
  );
}

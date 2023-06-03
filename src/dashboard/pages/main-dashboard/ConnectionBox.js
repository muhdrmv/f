import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './Title';
import Button from '@material-ui/core/Button';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

function preventDefault(event) {
    event.preventDefault();
}

const useStyles = makeStyles({
    depositContext: {
        flex: 1,
    },
});

export default function ConnectionBox({onClickConnect, name, protocol, accessRule}) {
    const classes = useStyles();
    return (
        <React.Fragment>
            <Title>
                {name}
            </Title>
            <Typography component="p" variant="h6" style={{fontSize: '1rem'}} gutterBottom>
                <SettingsEthernetIcon fontSize={"small"}  style={{position: 'relative', top: '5px', margin: '0 9px'}}/>
                {protocol}
            </Typography>
            <Typography component="p" variant="h6" style={{fontSize: '1rem'}} gutterBottom>
                <VpnKeyIcon fontSize={"small"} style={{position: 'relative', top: '5px', margin: '0 9px'}}/>
                {accessRule}
            </Typography>
            {/* <Typography color="textSecondary" className={classes.depositContext}>
        Last connected on 15 March, 2019
      </Typography> */}
            <div>
                <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                    startIcon={<OpenInNewIcon/>}
                    style={{width: '100%'}}
                    size="large"
                    disabled={false}
                    onClick={onClickConnect}
                >
                    Connect
                </Button>
            </div>
        </React.Fragment>
    );
}

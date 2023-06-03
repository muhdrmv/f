import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Link} from 'react-router-dom';
import {Button, CircularProgress} from '@material-ui/core';


const useToolbarStyles = makeStyles((theme) => ({
    formFooter: {
        textAlign: 'right',
        padding: theme.spacing(1),
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
        display: 'inline',
    },
    buttonProgress: {
        color: theme.palette.primary.main,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));


const BottomToolbar = (props) => {
    const classes = useToolbarStyles();
    const {backLinkUrl, onClickDone, inProgress} = props;

    return (
        <div  className={classes.formFooter}>

            { backLinkUrl &&
            <Button component={Link} to={backLinkUrl} size="large"
                    style={{marginRight: 7, marginLeft: 7}}>
                Back
            </Button>
            }

            <div className={classes.wrapper}>
                <Button color="primary" onClick={onClickDone} size="large" disabled={inProgress} >
                    Done
                </Button>
                {inProgress && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
             
        </div>
    );
};

export default BottomToolbar;
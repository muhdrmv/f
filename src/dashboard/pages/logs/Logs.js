import React from 'react'
import {makeStyles} from '@material-ui/core/styles';
import LogsBox from "../../shared-components/LogsBox";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
}));

const Logs = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <LogsBox />
        </div>
    )
}

export default Logs

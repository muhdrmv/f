import React from 'react';
import TopToolbar from "../../shared-components/TopToolbar";
import {Paper} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import AssessmentIcon from '@material-ui/icons/Assessment';
import Grid from "@material-ui/core/Grid";
import Charts from "../../charts/Charts";
import PieChart from "../../charts/PieChart";

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


const SectionCharts = () => {
    const classes = useStyles();

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="System Reports"
                        toolbarIcon={<AssessmentIcon style={{margin: '-4px 8px'}}/>}
                        backLinkUrl={'/dashboard/settings'} />

            <div className={classes.root}>
                <Grid container>

                    <Grid item xs={6}>
                        <div style={{padding: "20px"}}>

                            <h3>Daily sessions</h3>
                        </div>
                        <div style={{width: "100%", marginTop: "30px", padding: 30}}>
                            <Charts/>
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <div style={{padding: "20px"}}>
                            <h3>Connections by protocol</h3>
                        </div>
                        <div style={{width: "100%", marginTop: "30px", padding: 30}}>
                            <PieChart/>
                        </div>
                    </Grid>
                </Grid>

            </div>

        </Paper>
    );
};

export default SectionCharts;